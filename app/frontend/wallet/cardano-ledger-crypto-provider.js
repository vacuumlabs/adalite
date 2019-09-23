const LedgerTransportU2F = require('@ledgerhq/hw-transport-u2f').default
const LedgerTransportWebusb = require('@ledgerhq/hw-transport-webusb').default
const Ledger = require('@cardano-foundation/ledgerjs-hw-app-cardano').default
const cbor = require('borc')
const CachedDeriveXpubFactory = require('./helpers/CachedDeriveXpubFactory')
const debugLog = require('../helpers/debugLog')
const {TxWitness, SignedTransactionStructured} = require('./transaction')
const derivationSchemes = require('./derivation-schemes')
const NamedError = require('../helpers/NamedError')

const CardanoLedgerCryptoProvider = async (ADALITE_CONFIG, walletState) => {
  let transport
  try {
    transport = await LedgerTransportU2F.create()
  } catch (u2fError) {
    try {
      transport = await LedgerTransportWebusb.create()
    } catch (webUsbError) {
      debugLog(webUsbError)
      throw u2fError
    }
  }
  transport.setExchangeTimeout(ADALITE_CONFIG.ADALITE_LOGOUT_AFTER * 1000)
  const ledger = new Ledger(transport)
  const state = Object.assign(walletState, {
    derivationScheme: derivationSchemes.v2,
    rootHdPassphrase: null,
    derivedAddresses: {},
  })

  const isHwWallet = () => true
  const getHwWalletName = () => 'Ledger'

  const deriveXpub = CachedDeriveXpubFactory(state.derivationScheme, async (absDerivationPath) => {
    const response = await ledger.getExtendedPublicKey(absDerivationPath)
    const xpubHex = response.publicKeyHex + response.chainCodeHex
    return Buffer.from(xpubHex, 'hex')
  })

  function deriveHdNode(childIndex) {
    throw NamedError(
      'UnsupportedOperationError',
      'This operation is not supported on LedgerCryptoProvider!'
    )
  }

  function sign(message, absDerivationPath) {
    throw NamedError('UnsupportedOperationError', 'Operation not supported')
  }

  async function displayAddressForPath(absDerivationPath) {
    try {
      await ledger.showAddress(absDerivationPath)
    } catch (err) {
      throw NamedError('LedgerOperationError', `${err.name}: ${err.message}`, true)
    }
  }

  function getWalletSecret() {
    throw NamedError('UnsupportedOperationError', 'Unsupported operation!')
  }

  function getDerivationScheme() {
    return state.derivationScheme
  }

  function prepareInput(input, addressToAbsPathMapper, txDataHex) {
    return {
      txDataHex,
      outputIndex: input.outputIndex,
      path: addressToAbsPathMapper(input.utxo.address),
    }
  }

  function prepareOutput(output, addressToAbsPathMapper) {
    const result = {
      amountStr: `${output.coins}`,
    }

    if (output.isChange) {
      result.path = addressToAbsPathMapper(output.address)
    } else {
      result.address58 = output.address
    }

    return result
  }

  async function prepareWitness(witness) {
    const extendedPublicKey = await deriveXpub(witness.path)
    return TxWitness(extendedPublicKey, Buffer.from(witness.witnessSignatureHex, 'hex'))
  }

  function prepareBody(unsignedTx, txWitnesses) {
    return cbor.encode(SignedTransactionStructured(unsignedTx, txWitnesses)).toString('hex')
  }

  async function signTx(unsignedTx, rawInputTxs, addressToAbsPathMapper) {
    const transactions = rawInputTxs.map((tx) => tx.toString('hex'))

    const inputs = await Promise.all(
      unsignedTx.inputs.map((input, i) =>
        prepareInput(input, addressToAbsPathMapper, transactions[i])
      )
    )
    const outputs = await Promise.all(
      unsignedTx.outputs.map((output) => prepareOutput(output, addressToAbsPathMapper))
    )

    const response = await ledger.signTransaction(inputs, outputs)

    if (response.txHashHex !== unsignedTx.getId()) {
      throw NamedError(
        'TxSerializationError',
        'Tx serialization mismatch between Ledger and Adalite', // add important info for the devs
        true
      )
    }

    // serialize signed transaction for submission
    const txWitnesses = await Promise.all(
      response.witnesses.map((witness) => prepareWitness(witness))
    )
    return {
      txHash: response.txHashHex,
      txBody: prepareBody(unsignedTx, txWitnesses),
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

module.exports = CardanoLedgerCryptoProvider
