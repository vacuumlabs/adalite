import LedgerTransportU2F from '@ledgerhq/hw-transport-u2f'
import LedgerTransportWebusb from '@ledgerhq/hw-transport-webusb'
import Ledger, {AddressTypeNibbles} from '@cardano-foundation/ledgerjs-hw-app-cardano'
import {encode} from 'borc'
import CachedDeriveXpubFactory from '../helpers/CachedDeriveXpubFactory'
import debugLog from '../../helpers/debugLog'
import {
  ShelleyTxWitnessShelley,
  ShelleyTxWitnessByron,
  ShelleySignedTransactionStructured,
} from './shelley-transaction'
import * as platform from 'platform'
import {hasMinimalVersion} from './helpers/version-check'

import {
  bechAddressToHex,
  isShelleyPath,
  isShelleyFormat,
  base58AddressToHex,
} from './helpers/addresses'

import derivationSchemes from '../helpers/derivation-schemes'
import NamedError from '../../helpers/NamedError'

const isWebUsbSupported = async () => {
  const isSupported = await LedgerTransportWebusb.isSupported()
  return isSupported && platform.os.family !== 'Windows' && platform.name !== 'Opera'
}

const ShelleyLedgerCryptoProvider = async ({network, config, isWebUSB}) => {
  let transport
  try {
    const support = await isWebUsbSupported()
    if (support || isWebUSB) {
      transport = await LedgerTransportWebusb.create()
    } else {
      transport = await LedgerTransportU2F.create()
    }
  } catch (hwTransportError) {
    // fallback to U2F in any case
    try {
      transport = await LedgerTransportU2F.create()
    } catch (u2fError) {
      debugLog(u2fError)
      throw hwTransportError
    }
  }
  transport.setExchangeTimeout(config.ADALITE_LOGOUT_AFTER * 1000)
  const ledger = new Ledger(transport)
  const derivationScheme = derivationSchemes.v2

  const version = await ledger.getVersion()

  checkVersion()

  const isHwWallet = () => true
  const getWalletName = () => 'Ledger'

  const deriveXpub = CachedDeriveXpubFactory(derivationScheme, async (absDerivationPath) => {
    const response = await ledger.getExtendedPublicKey(absDerivationPath)
    const xpubHex = response.publicKeyHex + response.chainCodeHex
    return Buffer.from(xpubHex, 'hex')
  })

  function checkVersion(recommended: boolean = false) {
    if (!hasMinimalVersion(version, recommended)) {
      const errorName = recommended ? 'NotRecommendedCardanoAppVerion' : 'OutdatedCardanoAppError'
      throw NamedError(errorName, {
        message: `${version.major}.${version.minor}.${version.patch}`,
      })
    }
  }

  function deriveHdNode(childIndex) {
    throw NamedError('UnsupportedOperationError', {
      message: 'This operation is not supported on LedgerCryptoProvider!',
    })
  }

  function sign(message, absDerivationPath) {
    throw NamedError('UnsupportedOperationError', {message: 'Operation not supported'})
  }

  async function displayAddressForPath(absDerivationPath, stakingPath?) {
    try {
      await ledger.showAddress(
        AddressTypeNibbles.BASE,
        network.networkId,
        absDerivationPath,
        stakingPath
      )
    } catch (err) {
      throw NamedError('LedgerOperationError', {message: `${err.name}: ${err.message}`})
    }
  }

  function getWalletSecret() {
    throw NamedError('UnsupportedOperationError', {message: 'Unsupported operation!'})
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

  type OutputTypeChange = {
    addressTypeNibble: number
    spendingPath: any //BIP32Path,
    amountStr: string
    stakingPath?: any //BIP32Path,
    stakingKeyHashHex?: string
  }

  type Certificate = {
    type: number
    path: any //BIP32Path,
    poolKeyHashHex?: string
  }

  type Withdrawal = {
    path: any //BIP32Path,
    amountStr: string
  }

  function _prepareCert(cert, addressToAbsPathMapper): Certificate {
    return {
      type: cert.type,
      path: addressToAbsPathMapper(cert.accountAddress),
      poolKeyHashHex: cert.poolHash,
    }
  }

  function _prepareOutput(output): OutputTypeAddress | OutputTypeChange {
    return output.isChange
      ? {
        addressTypeNibble: 0, // TODO: get from address
        spendingPath: output.spendingPath,
        amountStr: `${output.coins}`,
        stakingPath: output.stakingPath,
      }
      : {
        amountStr: `${output.coins}`,
        addressHex: isShelleyFormat(output.address)
          ? bechAddressToHex(output.address)
          : base58AddressToHex(output.address),
      }
  }

  function _prepareWithdrawal(withdrawal, addressToAbsPathMapper): Withdrawal {
    return {
      path: addressToAbsPathMapper(withdrawal.address),
      amountStr: `${withdrawal.rewards}`,
    }
  }

  const xpub2pub = (xpub: Buffer) => xpub.slice(0, 32) // TODO: export from addresses

  const ShelleyWitness = async (witness) => {
    const xpub = await deriveXpub(witness.path)
    const publicKey = xpub2pub(xpub)
    const signature = Buffer.from(witness.witnessSignatureHex, 'hex')
    return ShelleyTxWitnessShelley(publicKey, signature)
  }

  const ByronWitness = async (witness) => {
    const xpub = await deriveXpub(witness.path)
    const publicKey = xpub2pub(xpub)
    const chainCode = xpub.slice(32, 64) // TODO: move this somewhere
    // TODO: unless we create pathToAddressMapper we cant get this from cardano-crypto
    const addressAttributes = encode({})
    const signature = Buffer.from(witness.witnessSignatureHex, 'hex')
    return ShelleyTxWitnessByron(publicKey, signature, chainCode, addressAttributes)
  }

  const prepareWitnesses = async (ledgerWitnesses) => {
    const _shelleyWitnesses = []
    const _byronWitnesses = []
    ledgerWitnesses.forEach((witness) => {
      isShelleyPath(witness.path)
        ? _shelleyWitnesses.push(ShelleyWitness(witness))
        : _byronWitnesses.push(ByronWitness(witness))
    })
    const shelleyWitnesses = await Promise.all(_shelleyWitnesses)
    const byronWitnesses = await Promise.all(_byronWitnesses)
    const witnesses = new Map()
    if (shelleyWitnesses.length > 0) {
      witnesses.set(0, shelleyWitnesses)
    }
    if (byronWitnesses.length > 0) {
      witnesses.set(2, byronWitnesses)
    }
    return witnesses
  }

  function prepareBody(unsignedTx, txWitnesses) {
    return encode(ShelleySignedTransactionStructured(unsignedTx, txWitnesses, null)).toString('hex')
  }

  async function signTx(unsignedTx, rawInputTxs, addressToAbsPathMapper) {
    const inputs = unsignedTx.inputs.map((input, i) => _prepareInput(input, addressToAbsPathMapper))
    const outputs = unsignedTx.outputs.map((output) => _prepareOutput(output))
    const certificates = unsignedTx.certs.map((cert) => _prepareCert(cert, addressToAbsPathMapper))
    const feeStr = `${unsignedTx.fee.fee}`
    const ttlStr = `${unsignedTx.ttl.ttl}`
    const withdrawals = unsignedTx.withdrawals
      ? [_prepareWithdrawal(unsignedTx.withdrawals, addressToAbsPathMapper)]
      : []

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

    if (response.txHashHex !== unsignedTx.getId()) {
      throw NamedError('TxSerializationError', {
        message: 'Tx serialization mismatch between Ledger and Adalite',
      })
    }
    // serialize signed transaction for submission
    const txWitnesses = await prepareWitnesses(response.witnesses)
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
    getWalletName,
    _sign: sign,
    _deriveHdNode: deriveHdNode,
    checkVersion,
  }
}

export default ShelleyLedgerCryptoProvider
