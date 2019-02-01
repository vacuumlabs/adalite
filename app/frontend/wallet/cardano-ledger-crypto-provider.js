const TransportU2F = require('@ledgerhq/hw-transport-u2f').default // for browser
const Ada = require('@ledgerhq/hw-app-ada').default
const CachedDeriveXpubFactory = require('./helpers/CachedDeriveXpubFactory')
const cbor = require('borc')
const {TxWitness, SignedTransactionStructured} = require('./transaction')

const CardanoLedgerCryptoProvider = async (ADALITE_CONFIG, walletState) => {
  const transport = await TransportU2F.create()
  const ada = new Ada(transport)

  const state = Object.assign(walletState, {
    rootHdPassphrase: null,
    derivedAddresses: {},
  })

  if (state.derivationScheme.type !== 'v2') {
    throw new Error(`Unsupported derivation scheme: ${state.derivationScheme.type}`)
  }

  const deriveXpub = CachedDeriveXpubFactory(state.derivationScheme, async (absDerivationPath) => {
    try {
      const response = await ada.getExtendedPublicKey(absDerivationPath)
      return Buffer.from(response.publicKeyHex.concat(response.chainCodeHex), 'hex')
    } catch (err) {
      throw new Error('public key retrieval from Ledger failed')
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
      await ada.showAddress(absDerivationPath)
    } catch (err) {
      throw new Error('Ledger operation failed!')
    }
  }

  function getWalletSecret() {
    throw new Error('Unsupported operation!')
  }

  function prepareInput(input, addressToAbsPathMapper, txDataHex) {
    const data = {
      txDataHex,
      outputIndex: input.outputIndex,
      path: addressToAbsPathMapper(input.utxo.address),
    }

    return data
  }

  function prepareOutput(output, addressToAbsPathMapper) {
    const data = {
      amountStr: `${output.coins}`,
    }

    if (output.isChange) {
      data.path = addressToAbsPathMapper(output.address)
    } else {
      data.address58 = output.address
    }

    return data
  }

  async function prepareWitnesses(witnesses) {
    const data = []
    for (const witness of witnesses) {
      const extendedPublicKey = await deriveXpub(witness.path)
      data.push(TxWitness(extendedPublicKey, Buffer.from(witness.witnessHex, 'hex')))
    }

    return data
  }

  function prepareBody(unsignedTx, txWitnesses) {
    return cbor.encode(SignedTransactionStructured(unsignedTx, txWitnesses)).toString('hex')
  }

  async function signTx(unsignedTx, rawInputTxs, addressToAbsPathMapper) {
    const transactions = rawInputTxs.map((tx) => tx.toString('hex'))

    const inputs = []
    for (let i = 0; i < unsignedTx.inputs.length; i++) {
      inputs.push(await prepareInput(unsignedTx.inputs[i], addressToAbsPathMapper, transactions[i]))
    }

    const outputs = []
    for (const output of unsignedTx.outputs) {
      const data = await prepareOutput(output, addressToAbsPathMapper)
      outputs.push(data)
    }

    try {
      const response = await ada.signTransaction(inputs, outputs)

      if (response.txHashHex !== unsignedTx.getId()) {
        throw new Error('Ledger: Transaction was corrupted')
      } else {
        const txWitnesses = await prepareWitnesses(response.witnesses)
        return {
          txHash: response.txHashHex,
          txBody: prepareBody(unsignedTx, txWitnesses),
        }
      }
    } catch (err) {
      throw new Error(err)
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
