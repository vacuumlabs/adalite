const {derivePublic} = require('cardano-crypto.js')
const indexIsHardened = require('./helpers/indexIsHardened')
// eslint-disable-next-line import/no-unresolved
const {default: TrezorConnect} = require('trezor-connect')

const CardanoTrezorCryptoProvider = (ADALITE_CONFIG, walletState) => {
  const state = Object.assign(walletState, {
    derivedXpubs: {},
    rootHdPassphrase: null,
    derivedAddresses: {},
  })

  if (state.derivationScheme.type !== 'v2') {
    throw new Error(`Unsupported derivation scheme: ${state.derivationScheme.type}`)
  }

  async function trezorDeriveAddress(absDerivationPath, displayConfirmation) {
    const response = await TrezorConnect.cardanoGetAddress({
      path: absDerivationPath,
      showOnTrezor: displayConfirmation,
    })

    if (response.success) {
      state.derivedAddresses[JSON.stringify(absDerivationPath)] = {
        derivationPath: absDerivationPath,
        address: response.payload.address,
      }
      return response.payload.address
    }

    throw new Error('Trezor operation failed!')
  }

  function deriveXpub(absDerivationPath) {
    const memoKey = JSON.stringify(absDerivationPath)

    if (!state.derivedXpubs[memoKey]) {
      const deriveHardened =
        absDerivationPath.length === 0 ||
        indexIsHardened(absDerivationPath[absDerivationPath.length - 1])

      /*
      * TODO - reset cache if the promise fails, for now it does not matter
      * since a failure (e.g. rejection by user) there leads to
      * the creation of a fresh wallet instance
      */
      state.derivedXpubs[memoKey] = deriveHardened
        ? deriveXpubHardened(absDerivationPath)
        : deriveXpubNonHardened(absDerivationPath)
    }

    return state.derivedXpubs[memoKey]
  }

  function deriveXpubHardened(absDerivationPath) {
    return TrezorConnect.cardanoGetPublicKey({
      path: absDerivationPath,
      showOnTrezor: false,
    }).then((response) => {
      if (response.error || !response.success) {
        return Promise.reject(response || 'operation failed')
      }
      return Buffer.from(response.payload.publicKey, 'hex')
    })
  }

  async function deriveXpubNonHardened(absDerivationPath) {
    const lastIndex = absDerivationPath[absDerivationPath.length - 1]
    const parentXpub = await deriveXpub(absDerivationPath.slice(0, absDerivationPath.length - 1))

    return derivePublic(parentXpub, lastIndex, state.derivationScheme.number)
  }

  function deriveHdNode(childIndex) {
    throw new Error('This operation is not supported on TrezorCryptoProvider!')
  }

  function sign(message, absDerivationPath) {
    throw new Error('Not supported')
  }

  async function trezorVerifyAddress(address, addressToAbsPathMapper) {
    const absDerivationPath = addressToAbsPathMapper(address)
    await trezorDeriveAddress(absDerivationPath, true)
  }

  function prepareInput(input, addressToAbsPathMapper) {
    const data = {
      prev_hash: input.txHash,
      prev_index: input.outputIndex,
      type: 0,
      path: addressToAbsPathMapper(input.utxo.address),
    }

    return data
  }

  function prepareOutput(output, addressToAbsPathMapper) {
    const data = {
      amount: `${output.coins}`,
    }

    if (output.isChange) {
      data.path = addressToAbsPathMapper(output.address)
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

  async function signTx(unsignedTx, rawInputTxs, addressToAbsPathMapper) {
    const inputs = []
    for (const input of unsignedTx.inputs) {
      inputs.push(await prepareInput(input, addressToAbsPathMapper))
    }

    const outputs = []
    for (const output of unsignedTx.outputs) {
      const data = await prepareOutput(output, addressToAbsPathMapper)
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
    signTx,
    trezorVerifyAddress,
    deriveXpub,
    _sign: sign,
    _deriveHdNode: deriveHdNode,
  }
}

module.exports = CardanoTrezorCryptoProvider
