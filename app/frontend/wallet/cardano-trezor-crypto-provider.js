const BlockchainExplorer = require('./blockchain-explorer')
const derivePublic = require('./helpers/derivePublic')
const {packAddress, unpackAddress} = require('./address')
const {toBip32Path} = require('./helpers/bip32')

const CardanoTrezorCryptoProvider = (CARDANOLITE_CONFIG, walletState) => {
  const state = Object.assign(walletState, {
    derivedXpubs: {},
    rootHdPassphrase: null,
    derivedAddresses: {},
  })

  let TrezorConnect
  if (CARDANOLITE_CONFIG.CARDANOLITE_ENABLE_TREZOR) {
    // eslint-disable-next-line import/no-unresolved
    TrezorConnect = require('trezor-connect')
  }

  const blockchainExplorer = BlockchainExplorer(CARDANOLITE_CONFIG, state)

  async function getWalletId() {
    return await deriveAddress([], 'hardened')
  }

  async function deriveAddresses(derivationPaths, derivationMode) {
    const addresses = []

    for (const derivationPath of derivationPaths) {
      addresses.push(await deriveAddress(derivationPath, derivationMode))
    }

    return addresses
  }

  function trezorDeriveAddress(derivationPath, displayConfirmation) {
    return new Promise((resolve, reject) => {
      const path = toBip32Path(derivationPath)

      callTrezor((shouldRejectOnError) => {
        TrezorConnect.adaGetAddress(path, displayConfirmation, (response) => {
          if (response.success) {
            state.derivedAddresses[JSON.stringify(derivationPath)] = {
              derivationPath,
              address: response.address,
            }

            resolve(response.address)
          } else {
            if (shouldRejectOnError(response.error)) {
              reject(response.error)
            }
          }
        })
      })
    })
  }

  async function deriveAddress(derivationPath, derivationMode) {
    const memoKey = JSON.stringify(derivationPath)
    if (!state.derivedAddresses[memoKey]) {
      if (derivationMode === 'hardened') {
        await trezorDeriveAddress(derivationPath, true)
      } else {
        const xpub = await deriveXpub(derivationPath, derivationMode)
        const hdPassphrase = Buffer.from(await getRootHdPassphrase(), 'hex')

        const address = packAddress(derivationPath, xpub, hdPassphrase)
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

  function deriveTrezorXpub(derivationPath) {
    return new Promise((resolve, reject) => {
      // m/44'/1815'/0'/0/childIndex
      const path = toBip32Path(derivationPath)

      callTrezor((shouldRejectOnError) => {
        TrezorConnect.adaGetPublicKey(path, (response) => {
          if (response.success) {
            const xpubData = {
              xpub: Buffer.from(response.xpub, 'hex'),
              root_hd_passphrase: Buffer.from(response.root_hd_passphrase, 'hex'),
            }

            if (!state.rootHdPassphrase) {
              state.rootHdPassphrase = xpubData.root_hd_passphrase
            }

            resolve(xpubData)
          } else {
            if (shouldRejectOnError(response.error)) {
              reject(response.error)
            }
          }
        })
      })
    })
  }

  async function deriveXpubNonHardened(derivationPath) {
    const parentPath = derivationPath.slice(0, derivationPath.length - 1)
    const childPath = derivationPath.slice(derivationPath.length - 1, derivationPath.length)

    // this reduce ensures that this would work even for empty derivation path
    return childPath.reduce(derivePublic, await deriveXpub(parentPath, 'hardened'))
  }

  function deriveHdNode(childIndex) {
    throw new Error('This operation is not supported on TrezorCryptoProvider!')
  }

  function sign(message, derivationPath) {
    return new Promise((resolve, reject) => {
      const messageToSign = Buffer.from(message, 'hex').toString('utf8')

      // m/44'/1815'/0'/0/childIndex
      const path = toBip32Path(derivationPath)

      callTrezor((shouldRejectOnError) => {
        TrezorConnect.adaSignMessage(path, messageToSign, (response) => {
          if (response.success) {
            resolve(Buffer.from(response.signature, 'hex'))
          } else {
            if (shouldRejectOnError(response.error)) {
              reject(response.error)
            }
          }
        })
      })
    })
  }

  async function getRootHdPassphrase() {
    if (!state.rootHdPassphrase) {
      state.rootHdPassphrase = (await deriveTrezorXpub([])).root_hd_passphrase
    }

    return state.rootHdPassphrase
  }

  async function getDerivationPathFromAddress(address) {
    const cachedAddress = Object.values(state.derivedAddresses).find(
      (record) => record.address === address
    )

    if (cachedAddress) {
      return cachedAddress.derivationPath
    } else {
      return unpackAddress(address, await getRootHdPassphrase()).derivationPath
    }
  }

  async function trezorVerifyAddress(address) {
    const derivationPath = await getDerivationPathFromAddress(address)
    await trezorDeriveAddress(derivationPath, true)
  }

  async function prepareInput(input) {
    const data = {
      prev_hash: input.txHash,
      prev_index: input.outputIndex,
      type: 0,
    }

    const derivationPath = await getDerivationPathFromAddress(input.utxo.address)
    data.address_n = toBip32Path(derivationPath)

    return data
  }

  async function prepareOutput(output) {
    const data = {
      amount: output.coins,
    }

    if (output.isChange) {
      const derivationPath = await getDerivationPathFromAddress(output.address)
      data.address_n = toBip32Path(derivationPath)
    } else {
      data.address = output.address
    }

    return data
  }

  async function signTx(unsignedTx) {
    const inputs = []
    for (const input of unsignedTx.inputs) {
      inputs.push(await prepareInput(input))
    }

    const transactions = []
    for (const input of inputs) {
      const transaction = (await blockchainExplorer.fetchTxRaw(input.prev_hash)).toString('hex')
      transactions.push(transaction)
    }

    const outputs = []
    for (const output of unsignedTx.outputs) {
      const data = await prepareOutput(output)
      outputs.push(data)
    }

    return new Promise((resolve, reject) => {
      callTrezor((shouldRejectOnError) => {
        TrezorConnect.adaSignTransaction(inputs, outputs, transactions, (response) => {
          if (response.success) {
            resolve({txHash: response.tx_hash, txBody: response.tx_body})
          } else {
            if (shouldRejectOnError(response.error)) {
              reject(response.error)
            }
          }
        })
      })
    })
  }

  function callTrezor(callback) {
    callback((error) => {
      if (error === 'Window closed') {
        setTimeout(() => callTrezor(callback), 200)
        return false
      }
      return true
    })
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
