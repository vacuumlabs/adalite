import LedgerTransportU2F from '@ledgerhq/hw-transport-u2f'
import LedgerTransportWebusb from '@ledgerhq/hw-transport-webusb'
import Ledger from '@cardano-foundation/ledgerjs-hw-app-cardano'
import {encode} from 'borc'
import CachedDeriveXpubFactory from '../helpers/CachedDeriveXpubFactory'
import debugLog from '../../helpers/debugLog'
import {HARDENED_THRESHOLD} from '../constants'
import {
  ShelleyTxWitnessShelley,
  ShelleyTxWitnessByron,
  ShelleySignedTransactionStructured,
} from './shelley-transaction'

import {bechAddressToHex} from './helpers/addresses'
// eslint-disable-next-line no-duplicate-imports
// import type {OutputTypeAddress, InputTypeUTxO} from '@cardano-foundation/ledgerjs-hw-app-cardano'

import derivationSchemes from '../helpers/derivation-schemes'
import NamedError from '../../helpers/NamedError'

const ShelleyLedgerCryptoProvider = async ({network, config}) => {
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

  const derivePub = CachedDeriveXpubFactory(derivationScheme, async (absDerivationPath) => {
    const response = await ledger.getExtendedPublicKey(absDerivationPath)
    return Buffer.from(response.publicKeyHex, 'hex')
  })

  // TODO: refacotr
  const getChainCode = CachedDeriveXpubFactory(derivationScheme, async (absDerivationPath) => {
    const response = await ledger.getExtendedPublicKey(absDerivationPath)
    return Buffer.from(response.chainCodeHex, 'hex')
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

  function _prepareInput(input, addressToAbsPathMapper): InputTypeUTxO {
    return {
      txHashHex: input.txid,
      outputIndex: input.outputNo,
      path: addressToAbsPathMapper(input.address),
    }
  }

  type InputTypeUTxO = {
    txHashHex: string
    outputIndex: number
    path: any //BIP32Path,
  }

  type OutputTypeAddress = {
    amountStr: string
    addressHex: string
  }

  function _prepareOutput(output, addressToAbsPathMapper): OutputTypeAddress {
    return {
      amountStr: `${output.coins}`,
      addressHex: bechAddressToHex(output.address),
    }
  }

  async function prepareWitness(witness) {
    const isShelleyPath = (path) => path[0] - HARDENED_THRESHOLD === 1852 // TODO: move this somewhere
    const {chainCodeHex, publicKeyHex} = await ledger.getExtendedPublicKey(witness.path)
    const chainCode = Buffer.from(chainCodeHex, 'hex')
    const publicKey = Buffer.from(publicKeyHex, 'hex')
    const signature = Buffer.from(witness.witnessSignatureHex, 'hex')
    return isShelleyPath(witness.path)
      ? ShelleyTxWitnessShelley(publicKey, signature)
      : ShelleyTxWitnessByron(publicKey, signature, chainCode, {})
  }

  function prepareBody(unsignedTx, txWitnesses) {
    return encode(ShelleySignedTransactionStructured(unsignedTx, txWitnesses, null)).toString('hex')
  }

  async function signTx(unsignedTx, rawInputTxs, addressToAbsPathMapper) {
    const inputs = unsignedTx.inputs.map((input, i) => _prepareInput(input, addressToAbsPathMapper))

    const outputs = unsignedTx.outputs.map((output) =>
      _prepareOutput(output, addressToAbsPathMapper)
    )
    const feeStr = `${unsignedTx.fee.fee}`
    const ttlStr = `${network.ttl}`

    const certificates = []
    const withdrawals = []
    console.log({
      networkId: network.networkId,
      magic: network.protocolMagic,
      inputs,
      outputs,
      feeStr,
      ttlStr,
      certificates,
      withdrawals,
    })
    const response = await ledger.signTransaction(
      network.networkId,
      network.protocolMagic,
      inputs,
      outputs,
      feeStr,
      ttlStr,
      certificates,
      withdrawals
    )

    const adaliteTx = ShelleySignedTransactionStructured(unsignedTx, [], [])
    console.log('adalite_tx', encode(adaliteTx).toString('hex'))

    console.log(response)
    console.log(response.txHashHex, unsignedTx.getId())
    // serialize signed transaction for submission
    const txWitnesses = await Promise.all(
      response.witnesses.map((witness) => prepareWitness(witness))
    )

    console.log(txWitnesses)

    if (response.txHashHex !== unsignedTx.getId()) {
      throw NamedError(
        'TxSerializationError',
        'Tx serialization mismatch between Ledger and Adalite'
      )
    }
    return {
      txHash: response.txHashHex,
      txBody: prepareBody(unsignedTx, txWitnesses),
    }
  }

  return {
    network,
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

export default ShelleyLedgerCryptoProvider
