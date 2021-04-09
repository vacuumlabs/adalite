import LedgerTransportU2F from '@ledgerhq/hw-transport-u2f'
import LedgerTransportWebusb from '@ledgerhq/hw-transport-webusb'
import Ledger, {AddressTypeNibbles} from '@cardano-foundation/ledgerjs-hw-app-cardano'
import * as cbor from 'borc'
import CachedDeriveXpubFactory from '../helpers/CachedDeriveXpubFactory'
import debugLog from '../../helpers/debugLog'
import {
  ShelleySignedTransactionStructured,
  cborizeTxWitnesses,
  cborizeCliWitness,
} from './shelley-transaction'
import * as platform from 'platform'
import {hasRequiredVersion} from './helpers/version-check'
import {LEDGER_VERSIONS, LEDGER_ERRORS} from '../constants'
import {captureMessage} from '@sentry/browser'
import {bech32} from 'cardano-crypto.js'
import {
  bechAddressToHex,
  isShelleyPath,
  isShelleyFormat,
  base58AddressToHex,
  xpub2pub,
  xpub2ChainCode,
} from './helpers/addresses'

import derivationSchemes from '../helpers/derivation-schemes'
import {
  CryptoProvider,
  CryptoProviderFeature,
  BIP32Path,
  HexString,
  DerivationScheme,
  AddressToPathMapper,
  CertificateType,
  TokenBundle,
} from '../../types'
import {
  Network,
  TxByronWitness,
  TxCertificate,
  TxDelegationCert,
  TxInput,
  TxOutput,
  TxShelleyWitness,
  TxStakepoolRegistrationCert,
  TxStakingKeyDeregistrationCert,
  TxStakingKeyRegistrationCert,
  TxWithdrawal,
  WalletName,
} from '../types'
import {
  LedgerAssetGroup,
  LedgerCertificate,
  LedgerGetExtendedPublicKeyResponse,
  LedgerInput,
  LedgerOutput,
  LedgerSignTransactionResponse,
  LedgerWithdrawal,
  LedgerWitness,
} from './ledger-types'
import {TxSigned, TxAux, CborizedCliWitness} from './types'
import {orderTokenBundle} from '../helpers/tokenFormater'
import {
  InternalError,
  InternalErrorReason,
  UnexpectedError,
  UnexpectedErrorReason,
} from '../../errors'

const isWebUsbSupported = async () => {
  const isSupported = await LedgerTransportWebusb.isSupported()
  return isSupported && platform.os.family !== 'Windows' && platform.name !== 'Opera'
}

const getLedgerTransport = async (forceWebUsb: boolean): Promise<any> => {
  if (forceWebUsb) {
    return await LedgerTransportWebusb.create()
  }

  let transport
  try {
    const support = await isWebUsbSupported()
    if (support) {
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
      captureMessage(
        JSON.stringify({
          u2fError: {name: u2fError.name, message: u2fError.message},
          hwTransportError: {name: hwTransportError.name, message: hwTransportError.message},
        })
      )
      throw hwTransportError
    }
  }

  return transport
}

type CryptoProviderParams = {
  network: Network
  config: any
  forceWebUsb: boolean
}

const ShelleyLedgerCryptoProvider = async ({
  network,
  config,
  forceWebUsb,
}: CryptoProviderParams): Promise<CryptoProvider> => {
  const transport = await getLedgerTransport(forceWebUsb)
  transport.setExchangeTimeout(config.ADALITE_LOGOUT_AFTER * 1000)
  const ledger = new Ledger(transport)
  const derivationScheme = derivationSchemes.v2

  const version = await ledger.getVersion()

  const getVersion = (): string => `${version.major}.${version.minor}.${version.patch}`

  ensureFeatureIsSupported(CryptoProviderFeature.MINIMAL)

  const isHwWallet = () => true
  const getWalletName = (): WalletName.LEDGER => WalletName.LEDGER

  const exportPublicKeys = async (
    derivationPaths: BIP32Path[]
  ): Promise<LedgerGetExtendedPublicKeyResponse[]> => {
    if (isFeatureSupported(CryptoProviderFeature.BULK_EXPORT)) {
      return await ledger.getExtendedPublicKeys(derivationPaths)
    }
    const response: LedgerGetExtendedPublicKeyResponse[] = []
    for (const path of derivationPaths) {
      response.push(await ledger.getExtendedPublicKey(path))
    }
    return response
  }

  const deriveXpub = CachedDeriveXpubFactory(
    derivationScheme,
    config.shouldExportPubKeyBulk && isFeatureSupported(CryptoProviderFeature.BULK_EXPORT),
    async (derivationPaths: BIP32Path[]) => {
      const response = await exportPublicKeys(derivationPaths)
      return response.map((res) => Buffer.from(res.publicKeyHex + res.chainCodeHex, 'hex'))
    }
  )

  function isFeatureSupported(feature: CryptoProviderFeature): boolean {
    return LEDGER_VERSIONS[feature] ? hasRequiredVersion(version, LEDGER_VERSIONS[feature]) : true
  }

  function ensureFeatureIsSupported(feature: CryptoProviderFeature): void {
    if (!isFeatureSupported(feature)) {
      throw new InternalError(LEDGER_ERRORS[feature], {
        message: `${version.major}.${version.minor}.${version.patch}`,
      })
    }
  }

  function getHdPassphrase(): void {
    throw new UnexpectedError(UnexpectedErrorReason.UnsupportedOperationError, {
      message: 'This operation is not supported on LedgerCryptoProvider!',
    })
  }

  function sign(message: HexString, absDerivationPath: BIP32Path): void {
    throw new UnexpectedError(UnexpectedErrorReason.UnsupportedOperationError, {
      message: 'Operation not supported',
    })
  }

  async function displayAddressForPath(
    absDerivationPath: BIP32Path,
    stakingPath?: BIP32Path
  ): Promise<void> {
    try {
      await ledger.showAddress(
        AddressTypeNibbles.BASE, // TODO: retrieve from the address
        network.networkId,
        absDerivationPath,
        stakingPath
      )
    } catch (err) {
      throw new InternalError(InternalErrorReason.LedgerOperationError, {
        message: `${err.name}: ${err.message}`,
      })
    }
  }

  function getWalletSecret(): void {
    throw new UnexpectedError(UnexpectedErrorReason.UnsupportedOperationError, {
      message: 'Unsupported operation!',
    })
  }

  function getDerivationScheme(): DerivationScheme {
    return derivationScheme
  }

  function prepareInput(input: TxInput, addressToAbsPathMapper: AddressToPathMapper): LedgerInput {
    return {
      txHashHex: input.txHash,
      outputIndex: input.outputIndex,
      path: input.address ? addressToAbsPathMapper(input.address) : null,
    }
  }

  const prepareTokenBundle = (tokenBundle: TokenBundle): LedgerAssetGroup[] => {
    // TODO: refactor, we should check the whole tx againt the version beforehand
    if (tokenBundle.length > 0 && !isFeatureSupported(CryptoProviderFeature.MULTI_ASSET)) {
      throw new InternalError(InternalErrorReason.LedgerMultiAssetNotSupported, {
        message:
          'Sending tokens is not supported on Ledger device. Please update your cardano application to the latest version.',
      })
    }
    const orderedTokenBundle = orderTokenBundle(tokenBundle)
    return orderedTokenBundle.map(({policyId, assets}) => {
      const tokens = assets.map(({assetName, quantity}) => ({
        assetNameHex: assetName,
        amountStr: quantity.toString(),
      }))
      return {
        policyIdHex: policyId,
        tokens,
      }
    })
  }

  function prepareOutput(output: TxOutput): LedgerOutput {
    const tokenBundle = prepareTokenBundle(output.tokenBundle)
    return output.isChange === false
      ? {
        amountStr: `${output.coins}`,
        addressHex: isShelleyFormat(output.address)
          ? bechAddressToHex(output.address)
          : base58AddressToHex(output.address),
        tokenBundle,
      }
      : {
        amountStr: `${output.coins}`,
        tokenBundle,
        addressTypeNibble: AddressTypeNibbles.BASE,
        spendingPath: output.spendingPath,
        stakingPath: output.stakingPath,
      }
  }

  function prepareStakingKeyRegistrationCertificate(
    certificate: TxStakingKeyRegistrationCert | TxStakingKeyDeregistrationCert,
    path: BIP32Path
  ): LedgerCertificate {
    return {
      type: certificate.type,
      path,
    }
  }

  function prepareDelegationCertificate(
    certificate: TxDelegationCert,
    path: BIP32Path
  ): LedgerCertificate {
    return {
      type: certificate.type,
      poolKeyHashHex: certificate.poolHash,
      path,
    }
  }

  function prepareStakepoolRegistrationCertificate(
    certificate: TxStakepoolRegistrationCert,
    path: BIP32Path
  ): LedgerCertificate {
    const {data} = bech32.decode(certificate.stakingAddress)
    const poolOwners = certificate.poolRegistrationParams.poolOwners.map((owner) => {
      return !Buffer.compare(Buffer.from(owner.stakingKeyHashHex, 'hex'), data.slice(1))
        ? {stakingPath: path}
        : {...owner}
    })
    if (!poolOwners.some((owner) => owner.stakingPath)) {
      throw new InternalError(InternalErrorReason.MissingOwner, {
        message: 'This HW device is not an owner of the pool stated in registration certificate.',
      })
    }
    return {
      type: certificate.type,
      poolRegistrationParams: {
        ...certificate.poolRegistrationParams,
        poolOwners,
      },
    }
  }

  function prepareCertificate(
    certificate: TxCertificate,
    addressToAbsPathMapper: AddressToPathMapper
  ): LedgerCertificate {
    const path = addressToAbsPathMapper(certificate.stakingAddress)
    switch (certificate.type) {
      case CertificateType.STAKING_KEY_REGISTRATION:
        return prepareStakingKeyRegistrationCertificate(certificate, path)
      case CertificateType.STAKING_KEY_DEREGISTRATION:
        return prepareStakingKeyRegistrationCertificate(certificate, path)
      case CertificateType.DELEGATION:
        return prepareDelegationCertificate(certificate, path)
      case CertificateType.STAKEPOOL_REGISTRATION:
        return prepareStakepoolRegistrationCertificate(certificate, path)
      default:
        throw new UnexpectedError(UnexpectedErrorReason.InvalidCertificateType)
    }
  }

  function prepareWithdrawal(
    withdrawal: TxWithdrawal,
    addressToAbsPathMapper: AddressToPathMapper
  ): LedgerWithdrawal {
    return {
      path: addressToAbsPathMapper(withdrawal.stakingAddress),
      amountStr: `${withdrawal.rewards}`,
    }
  }

  const prepareByronWitness = async (witness: LedgerWitness): Promise<TxByronWitness> => {
    const xpub = await deriveXpub(witness.path)
    const publicKey = xpub2pub(xpub)
    const chainCode = xpub2ChainCode(xpub)
    // only v1 witnesses has address atributes
    // since ledger is v2 they are always {}
    const addressAttributes = cbor.encode({})
    const signature = Buffer.from(witness.witnessSignatureHex, 'hex')
    return {
      publicKey,
      signature,
      chainCode,
      addressAttributes,
    }
  }

  const prepareShelleyWitness = async (witness: LedgerWitness): Promise<TxShelleyWitness> => {
    const xpub = await deriveXpub(witness.path)
    const publicKey = xpub2pub(xpub)
    const signature = Buffer.from(witness.witnessSignatureHex, 'hex')
    return {
      publicKey,
      signature,
    }
  }

  const prepareWitnesses = async (ledgerWitnesses: LedgerWitness[]) => {
    const _shelleyWitnesses = []
    const _byronWitnesses = []
    ledgerWitnesses.forEach((witness) => {
      isShelleyPath(witness.path)
        ? _shelleyWitnesses.push(prepareShelleyWitness(witness))
        : _byronWitnesses.push(prepareByronWitness(witness))
    })
    const shelleyWitnesses: TxShelleyWitness[] = await Promise.all(_shelleyWitnesses)
    const byronWitnesses: TxByronWitness[] = await Promise.all(_byronWitnesses)
    return {shelleyWitnesses, byronWitnesses}
  }

  async function signTx(
    txAux: TxAux,
    addressToAbsPathMapper: AddressToPathMapper
  ): Promise<TxSigned> {
    const inputs = txAux.inputs.map((input) => prepareInput(input, addressToAbsPathMapper))
    const outputs = txAux.outputs.map((output) => prepareOutput(output))
    const certificates = txAux.certificates.map((certificate) =>
      prepareCertificate(certificate, addressToAbsPathMapper)
    )
    const feeStr = `${txAux.fee}`
    const ttlStr = `${txAux.ttl}`
    const withdrawals = txAux.withdrawals.map((withdrawal) =>
      prepareWithdrawal(withdrawal, addressToAbsPathMapper)
    )

    const validityIntervalStart = txAux.validityIntervalStart
      ? `${txAux.validityIntervalStart}`
      : null

    const response: LedgerSignTransactionResponse = await ledger.signTransaction(
      network.networkId,
      network.protocolMagic,
      inputs,
      outputs,
      feeStr,
      ttlStr,
      certificates,
      withdrawals,
      null,
      validityIntervalStart
    )

    if (response.txHashHex !== txAux.getId()) {
      throw new InternalError(InternalErrorReason.TxSerializationError, {
        message: 'Tx serialization mismatch between Ledger and Adalite',
      })
    }

    const txMeta = null
    const {shelleyWitnesses, byronWitnesses} = await prepareWitnesses(response.witnesses)
    const txWitnesses = cborizeTxWitnesses(byronWitnesses, shelleyWitnesses)
    const structuredTx = ShelleySignedTransactionStructured(txAux, txWitnesses, txMeta)

    return {
      txHash: response.txHashHex,
      txBody: cbor.encode(structuredTx).toString('hex'),
    }
  }

  async function witnessPoolRegTx(
    txAux: TxAux,
    addressToAbsPathMapper: AddressToPathMapper
  ): Promise<CborizedCliWitness> {
    const txSigned = await signTx(txAux, addressToAbsPathMapper)
    return cborizeCliWitness(txSigned)
  }

  return {
    network,
    getWalletSecret,
    getDerivationScheme,
    signTx,
    witnessPoolRegTx,
    getHdPassphrase,
    displayAddressForPath,
    deriveXpub,
    isHwWallet,
    getWalletName,
    _sign: sign,
    isFeatureSupported,
    ensureFeatureIsSupported,
    getVersion,
  }
}

export default ShelleyLedgerCryptoProvider
