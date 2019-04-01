// eslint-disable-next-line import/no-unresolved
const CachedDeriveXpubFactory = require('./helpers/CachedDeriveXpubFactory')
const {ADALITE_SUPPORT_EMAIL} = require('./constants')
const derivationSchemes = require('./derivation-schemes')

const CardanoTrezorCryptoProvider = (ADALITE_CONFIG, walletState) => {
  const state = Object.assign(walletState, {
    rootHdPassphrase: null,
    derivedAddresses: {},
    derivationScheme: derivationSchemes.v2,
  })

  const TrezorConnect = ADALITE_CONFIG.ADALITE_TREZOR_CONNECT_URL
    ? window.TrezorConnect
    : require('trezor-connect').default

  TrezorConnect.manifest({
    email: ADALITE_SUPPORT_EMAIL,
    appUrl: ADALITE_CONFIG.ADALITE_SERVER_URL,
  })

  const isHwWallet = () => true
  const getHwWalletName = () => 'Trezor'

  const deriveXpub = CachedDeriveXpubFactory(state.derivationScheme, async (absDerivationPath) => {
    const response = await TrezorConnect.cardanoGetPublicKey({
      path: absDerivationPath,
      showOnTrezor: false,
    })
    if (response.error || !response.success) {
      throw new Error('public key retrieval from Trezor failed')
    }
    return Buffer.from(response.payload.publicKey, 'hex')
  })

  function deriveHdNode(childIndex) {
    throw new Error('This operation is not supported on TrezorCryptoProvider!')
  }

  function sign(message, absDerivationPath) {
    throw new Error('Not supported')
  }

  async function displayAddressForPath(absDerivationPath) {
    const response = await TrezorConnect.cardanoGetAddress({
      path: absDerivationPath,
      showOnTrezor: true,
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
      protocol_magic: state.network.protocolMagic,
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

  function getDerivationScheme() {
    return state.derivationScheme
  }

  return {
    getWalletSecret,
    getDerivationScheme,
    signTx,
    displayAddressForPath,
    deriveXpub,
    isHwWallet,
    getHwWalletName,
    _sign: sign,
    _deriveHdNode: deriveHdNode,
  }
}

module.exports = CardanoTrezorCryptoProvider
