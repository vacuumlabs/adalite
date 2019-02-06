const TransportU2F = require('@ledgerhq/hw-transport-u2f').default // for browser
const Ledger = require('ledgerhq/hw-app-ada').default // temporary hack, should be @ledgerhq
const CachedDeriveXpubFactory = require('./helpers/CachedDeriveXpubFactory')
const cbor = require('borc')
const {TxWitness, SignedTransactionStructured} = require('./transaction')

const CardanoLedgerCryptoProvider = async (ADALITE_CONFIG, walletState) => {
  const transport = await TransportU2F.create()
  const ledger = new Ledger(transport)

  const state = Object.assign(walletState, {
    rootHdPassphrase: null,
    derivedAddresses: {},
  })

  if (state.derivationScheme.type !== 'v2') {
    throw new Error(`Unsupported derivation scheme: ${state.derivationScheme.type}`)
  }

  const deriveXpub = CachedDeriveXpubFactory(state.derivationScheme, async (absDerivationPath) => {
    try {
      const response = await ledger.getExtendedPublicKey(absDerivationPath)
      return Buffer.from(response.publicKeyHex.concat(response.chainCodeHex), 'hex')
    } catch (err) {
      throw new Error('Public key retrieval from Ledger failed')
    }
  })

  function deriveHdNode(childIndex) {
    throw new Error('This operation is not supported on LedgerCryptoProvider!')
  }

  function sign(message, absDerivationPath) {
    throw new Error('Not supported')
  }

  async function displayAddressForPath(absDerivationPath) {
    try {
      await ledger.showAddress(absDerivationPath)
    } catch (err) {
      throw new Error('Ledger operation failed!')
    }
  }

  function getWalletSecret() {
    throw new Error('Unsupported operation!')
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
    return TxWitness(extendedPublicKey, Buffer.from(witness.witnessHex, 'hex'))
  }

  function prepareBody(unsignedTx, txWitnesses) {
    return cbor.encode(SignedTransactionStructured(unsignedTx, txWitnesses)).toString('hex')
  }

  async function signTx(unsignedTx, rawInputTxs, addressToAbsPathMapper) {
    const transactions = rawInputTxs.map((tx) => tx.toString('hex'))

    const inputs = await Promise.all(
      unsignedTx.inputs.map((input, i) =>
        prepareInput(input, addressToAbsPathMapper, transactions[i]))
    )

    const outputs = await Promise.all(
      unsignedTx.outputs.map((output) => prepareOutput(output, addressToAbsPathMapper))
    )

    const response = await ledger.signTransaction(inputs, outputs)

    if (response.txHashHex !== unsignedTx.getId()) {
      throw new Error('Tx serialization mismatch between Ledger and Adalite')
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
    signTx,
    displayAddressForPath,
    deriveXpub,
    _sign: sign,
    _deriveHdNode: deriveHdNode,
  }
}

module.exports = CardanoLedgerCryptoProvider
