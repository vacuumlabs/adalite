import LedgerTransportU2F from '@ledgerhq/hw-transport-u2f'
import LedgerTransportWebusb from '@ledgerhq/hw-transport-webusb'
import Ledger from '@cardano-foundation/ledgerjs-hw-app-cardano'
import {encode} from 'borc'
import CachedDeriveXpubFactory from '../helpers/CachedDeriveXpubFactory'
import debugLog from '../../helpers/debugLog'
import {TxWitness, SignedTransactionStructured} from './byron-transaction'

import derivationSchemes from '../helpers/derivation-schemes'
import NamedError from '../../helpers/NamedError'

const CardanoLedgerCryptoProvider = async ({config}) => {
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
  transport.setExchangeTimeout(config.ADALITE_LOGOUT_AFTER * 1000)
  const ledger = new Ledger(transport)
  const derivationScheme = derivationSchemes.v2

  const isHwWallet = () => true
  const getHwWalletName = () => 'Ledger'

  const deriveXpub = CachedDeriveXpubFactory(derivationScheme, async (absDerivationPath) => {
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
      throw NamedError('LedgerOperationError', `${err.name}: ${err.message}`)
    }
  }

  function getWalletSecret() {
    throw NamedError('UnsupportedOperationError', 'Unsupported operation!')
  }

  function getDerivationScheme() {
    return derivationScheme
  }

  function _prepareInput(input, addressToAbsPathMapper, txDataHex) {
    return {
      txDataHex,
      outputIndex: input.outputIndex,
      path: addressToAbsPathMapper(input.utxo.address),
    }
  }

  interface LedgerOutput {
    amountStr: string
    address58?: string
    path?: Array<number>
  }

  function _prepareOutput(output, addressToAbsPathMapper) {
    const result: LedgerOutput = {
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
    return encode(SignedTransactionStructured(unsignedTx, txWitnesses)).toString('hex')
  }

  async function signTx(unsignedTx, rawInputTxs, addressToAbsPathMapper) {
    const transactions = rawInputTxs.map((tx) => tx.toString('hex'))

    const inputs = unsignedTx.inputs.map((input, i) =>
      _prepareInput(input, addressToAbsPathMapper, transactions[i])
    )

    const outputs = unsignedTx.outputs.map((output) =>
      _prepareOutput(output, addressToAbsPathMapper)
    )

    const response = await ledger.signTransaction(inputs, outputs)

    if (response.txHashHex !== unsignedTx.getId()) {
      throw NamedError(
        'TxSerializationError',
        'Tx serialization mismatch between Ledger and Adalite'
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

export default CardanoLedgerCryptoProvider
