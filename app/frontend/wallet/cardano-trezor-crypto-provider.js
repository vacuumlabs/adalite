// eslint-disable-next-line import/no-unresolved
const CachedDeriveXpubFactory = require('./helpers/CachedDeriveXpubFactory')
const {ADALITE_SUPPORT_EMAIL} = require('./constants')
const derivationSchemes = require('./derivation-schemes')
const NamedError = require('../helpers/NamedError')
const debugLog = require('../helpers/debugLog')

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
    throwIfNotSuccess(response)
    return Buffer.from(response.payload.publicKey, 'hex')
  })

  function deriveHdNode(childIndex) {
    throw NamedError(
      'UnsupportedOperationError',
      'This operation is not supported on TrezorCryptoProvider!'
    )
  }

  function sign(message, absDerivationPath) {
    throw NamedError('UnsupportedOperationError', 'Not supported')
  }

  async function displayAddressForPath(absDerivationPath) {
    const response = await TrezorConnect.cardanoGetAddress({
      path: absDerivationPath,
      showOnTrezor: true,
    })

    throwIfNotSuccess(response)

    state.derivedAddresses[JSON.stringify(absDerivationPath)] = {
      derivationPath: absDerivationPath,
      address: response.payload.address,
    }
    return response.payload.address
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

    if (response.error || !response.success) {
      debugLog(response)
      throw new NamedError('TrezorSignTxError', response.payload.error)
    }

    return {
      txHash: response.payload.hash,
      txBody: response.payload.body,
    }
  }

  function getWalletSecret() {
    throw NamedError('UnsupportedOperationError', 'Unsupported operation!')
  }

  function getDerivationScheme() {
    return state.derivationScheme
  }

  function throwIfNotSuccess(response) {
    if (response.error || !response.success) {
      debugLog(response)
      throw new NamedError(
        'TrezorError',
        'Trezor operation failed, please make sure ad blockers are switched off for this site'
      )
    }
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
