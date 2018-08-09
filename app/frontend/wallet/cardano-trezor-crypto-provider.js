const {packAddress, derivePublic} = require('cardano-crypto.js')
const {toBip32Path, fromBip32Path} = require('./helpers/bip32')
// eslint-disable-next-line import/no-unresolved
const TrezorConnect = require('trezor-connect').default

const CardanoTrezorCryptoProvider = (ADALITE_CONFIG, walletState) => {
  const state = Object.assign(walletState, {
    derivedXpubs: {},
    rootHdPassphrase: null,
    derivedAddresses: {},
  })

  async function getWalletId() {
    return await deriveAddress([], 'hardened')
  }

  async function deriveAddresses(derivationPaths, derivationMode) {
    let addresses = derivationPaths
      .filter((path) => state.derivedAddresses[JSON.stringify(path)])
      .map((path) => state.derivedAddresses[JSON.stringify(path)].address)

    const pathsToDerive = derivationPaths.filter(
      (path) => !state.derivedAddresses[JSON.stringify(path)]
    )

    if (!pathsToDerive.length) {
      return addresses
    }

    if (derivationMode === 'hardened') {
      addresses = addresses.concat(await trezorDeriveAddresses(pathsToDerive, false))
    } else {
      for (const derivationPath of pathsToDerive) {
        addresses.push(await deriveAddress(derivationPath, derivationMode))
      }
    }

    return addresses
  }

  async function trezorDeriveAddresses(derivationPaths, displayConfirmation) {
    const bundle = derivationPaths.map((derivationPath) => ({
      path: toBip32Path(derivationPath),
      showOnTrezor: displayConfirmation,
    }))

    const response = await TrezorConnect.cardanoGetAddress({bundle})

    if (response.success) {
      return response.payload.map((responseAddress) => {
        const path = fromBip32Path(responseAddress.path)
        state.derivedAddresses[JSON.stringify(path)] = {
          derivationPath: path,
          address: responseAddress.address,
        }

        return responseAddress.address
      })
    }

    throw new Error('Trezor operation failed!')
  }

  async function trezorDeriveAddress(derivationPath, displayConfirmation) {
    const path = toBip32Path(derivationPath)
    const response = await TrezorConnect.cardanoGetAddress({
      path,
      showOnTrezor: displayConfirmation,
    })

    if (response.success) {
      state.derivedAddresses[JSON.stringify(derivationPath)] = {
        derivationPath,
        address: response.payload.address,
      }
      return response.payload.address
    }

    throw new Error('Trezor operation failed!')
  }

  async function deriveAddress(derivationPath, derivationMode) {
    const memoKey = JSON.stringify(derivationPath)
    if (!state.derivedAddresses[memoKey]) {
      if (derivationMode === 'hardened') {
        await trezorDeriveAddress(derivationPath, true)
      } else {
        const xpub = await deriveXpub(derivationPath, derivationMode)

        const address = packAddress(derivationPath, xpub, null, state.derivationScheme.number)
        state.derivedAddresses[JSON.stringify(derivationPath)] = {
          derivationPath,
          address,
        }
      }
    }

    return state.derivedAddresses[memoKey].address
  }

  async function deriveXpub(derivationPath, derivationMode) {
    const memoKey = JSON.stringify(derivationPath)

    if (!state.derivedXpubs[memoKey]) {
      let result

      if (derivationMode === 'hardened') {
        result = await deriveXpubHardened(derivationPath)
      } else if (derivationMode === 'nonhardened') {
        result = await deriveXpubNonHardened(derivationPath)
      } else {
        throw Error(`Unknown derivation mode: ${derivationMode}`)
      }

      state.derivedXpubs[memoKey] = result
    }

    return state.derivedXpubs[memoKey]
  }

  async function deriveXpubHardened(derivationPath) {
    return (await deriveTrezorXpub(derivationPath)).xpub
  }

  async function deriveTrezorXpub(derivationPath) {
    // m/44'/1815'/0'/0/childIndex
    const path = toBip32Path(derivationPath)

    const response = await TrezorConnect.cardanoGetPublicKey({
      path,
      showOnTrezor: true,
    })

    if (response.error) {
      throw new Error(response.error)
    }

    const xpubData = {
      xpub: Buffer.from(response.payload.publicKey, 'hex'),
      root_hd_passphrase: null,
    }

    return xpubData
  }

  async function deriveXpubNonHardened(derivationPath) {
    if (derivationPath.length < 1) {
      throw new Error('Derivation path must contain at least one indice')
    }

    const parentPath = derivationPath.slice(0, 1)
    const childPath = derivationPath.slice(1, derivationPath.length)

    // this reduce ensures that this would work even for empty derivation path
    return childPath.reduce(
      (parentXpub, childIndex) =>
        derivePublic(parentXpub, childIndex, state.derivationScheme.number),
      await deriveXpub(parentPath, 'hardened')
    )
  }

  function deriveHdNode(childIndex) {
    throw new Error('This operation is not supported on TrezorCryptoProvider!')
  }

  function sign(message, derivationPath) {
    throw new Error('Not supported')
  }

  function getDerivationPathFromAddress(address) {
    const cachedAddress = Object.values(state.derivedAddresses).find(
      (record) => record.address === address
    )

    if (cachedAddress) {
      return cachedAddress.derivationPath
    } else {
      throw new Error('Cannot find derivation path')
    }
  }

  async function trezorVerifyAddress(address) {
    const derivationPath = getDerivationPathFromAddress(address)
    await trezorDeriveAddress(derivationPath, true)
  }

  function prepareInput(input) {
    const data = {
      prev_hash: input.txHash,
      prev_index: input.outputIndex,
      type: 0,
    }

    const derivationPath = getDerivationPathFromAddress(input.utxo.address)
    data.path = toBip32Path(derivationPath)

    return data
  }

  function prepareOutput(output) {
    const data = {
      amount: `${output.coins}`,
    }

    if (output.isChange) {
      const derivationPath = getDerivationPathFromAddress(output.address)
      data.path = toBip32Path(derivationPath)
    } else {
      data.address = output.address
    }

    return data
  }

  function getNetworkInt(network) {
    switch (network) {
      case 'mainnet': {
        return 2
      }
      case 'testnet': {
        return 1
      }
      default: {
        throw new Error(`Unknown network: ${network}`)
      }
    }
  }

  async function signTx(unsignedTx, rawInputTxs) {
    const inputs = []
    for (const input of unsignedTx.inputs) {
      inputs.push(await prepareInput(input))
    }

    const outputs = []
    for (const output of unsignedTx.outputs) {
      const data = await prepareOutput(output)
      outputs.push(data)
    }

    const transactions = rawInputTxs.map((tx) => tx.toString('hex'))

    const response = await TrezorConnect.cardanoSignTransaction({
      inputs,
      outputs,
      transactions,
      network: getNetworkInt(state.network),
    })

    if (response.success) {
      return {
        txHash: response.payload.hash,
        txBody: response.payload.body,
      }
    } else {
      throw new Error(response.payload.error)
    }
  }

  function getWalletSecret() {
    throw new Error('Unsupported operation!')
  }

  return {
    getWalletSecret,
    deriveAddress,
    deriveAddresses,
    getWalletId,
    signTx,
    trezorVerifyAddress,
    getDerivationPathFromAddress,
    _sign: sign,
    _deriveHdNode: deriveHdNode,
  }
}

module.exports = CardanoTrezorCryptoProvider
