// eslint-disable-next-line import/no-unresolved
import CachedDeriveXpubFactory from '../helpers/CachedDeriveXpubFactory'
import {ADALITE_SUPPORT_EMAIL, TREZOR_ERRORS, TREZOR_VERSIONS} from '../constants'
import derivationSchemes from '../helpers/derivation-schemes'
import {
  InternalError,
  InternalErrorReason,
  UnexpectedError,
  UnexpectedErrorReason,
} from '../../errors'
import debugLog from '../../helpers/debugLog'
import {AddressTypes, bech32} from 'cardano-crypto.js'
import {hasRequiredVersion} from './helpers/version-check'
import {
  CryptoProvider,
  CertificateType,
  CryptoProviderFeature,
  BIP32Path,
  HexString,
  AddressToPathMapper,
  TokenBundle,
} from '../../types'
import {
  Network,
  TxCertificate,
  TxDelegationCert,
  TxInput,
  TxOutput,
  TxStakepoolRegistrationCert,
  TxStakingKeyDeregistrationCert,
  TxStakingKeyRegistrationCert,
  TxWithdrawal,
  WalletName,
} from '../types'
import {
  TrezorAddressParameters,
  TrezorGetAddressResponse,
  TrezorGetPublicKeyResponse,
  TrezorInput,
  TrezorMultiAsset,
  TrezorOutput,
  TrezorSignTxResponse,
  TrezorTxCertificate,
  TrezorWithdrawal,
} from './trezor-types'
import {TxSigned, TxAux, CborizedCliWitness} from './types'
import {encodeAddress} from './helpers/addresses'
import {TxRelayType, TxStakepoolRelay} from './helpers/poolCertificateUtils'
import {cborizeCliWitness} from './shelley-transaction'
import {removeNullFields} from '../../helpers/removeNullFiels'
import {orderTokenBundle} from '../helpers/tokenFormater'

type CryptoProviderParams = {
  network: Network
  config: any
}

const ShelleyTrezorCryptoProvider = async ({
  network,
  config,
}: CryptoProviderParams): Promise<CryptoProvider> => {
  const derivationScheme = derivationSchemes.v2

  const TrezorConnect = require('trezor-connect').default

  TrezorConnect.manifest({
    email: ADALITE_SUPPORT_EMAIL,
    appUrl: config.ADALITE_SERVER_URL,
  })

  const getTrezorVersion = async (): Promise<any> => {
    // TODO: add return type
    const {payload: features} = await TrezorConnect.getFeatures()
    const {major_version: major, minor_version: minor, patch_version: patch} = features
    return {major, minor, patch}
  }

  const version = await getTrezorVersion()

  const getVersion = (): string => `${version.major}.${version.minor}.${version.patch}`

  const isHwWallet = (): boolean => true
  const getWalletName = (): WalletName.TREZOR => WalletName.TREZOR

  const deriveXpub = CachedDeriveXpubFactory(
    derivationScheme,
    config.shouldExportPubKeyBulk,
    async (absDerivationPaths: BIP32Path[]) => {
      const bundle = absDerivationPaths.map((path: BIP32Path) => ({path, showOnTrezor: false}))
      const response: TrezorGetPublicKeyResponse = await TrezorConnect.cardanoGetPublicKey({
        bundle,
      })
      if (response.success === false) {
        throw new InternalError(InternalErrorReason.TrezorError, {message: response.payload.error})
      }
      return response.payload.map(({publicKey}) => Buffer.from(publicKey, 'hex'))
    }
  )

  function isFeatureSupported(feature: CryptoProviderFeature): boolean {
    return TREZOR_VERSIONS[feature] ? hasRequiredVersion(version, TREZOR_VERSIONS[feature]) : true
  }

  function ensureFeatureIsSupported(feature: CryptoProviderFeature): void {
    if (!isFeatureSupported(feature)) {
      throw new InternalError(TREZOR_ERRORS[feature], {
        message: `${version.major}.${version.minor}.${version.patch}`,
      })
    }
  }

  function getHdPassphrase(): void {
    throw new UnexpectedError(UnexpectedErrorReason.UnsupportedOperationError, {
      message: 'This operation is not supported on TrezorCryptoProvider!',
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
    const addressParameters: TrezorAddressParameters = {
      addressType: AddressTypes.BASE, // TODO: retrieve from address
      path: absDerivationPath,
      stakingPath,
    }
    const response: TrezorGetAddressResponse = await TrezorConnect.cardanoGetAddress({
      addressParameters,
      networkId: network.networkId,
      protocolMagic: network.protocolMagic,
      showOnTrezor: true,
    })
    if (response.success === false) {
      throw new InternalError(InternalErrorReason.TrezorError, {message: response.payload.error})
    }
  }

  function prepareInput(input: TxInput, addressToAbsPathMapper: AddressToPathMapper): TrezorInput {
    return {
      ...(input.address && {path: addressToAbsPathMapper(input.address)}),
      prev_hash: input.txHash,
      prev_index: input.outputIndex,
    }
  }

  const prepareTokenBundle = (tokenBundle: TokenBundle): TrezorMultiAsset | undefined => {
    // TODO: refactor
    if (tokenBundle.length > 0 && !isFeatureSupported(CryptoProviderFeature.MULTI_ASSET)) {
      throw new InternalError(InternalErrorReason.TrezorMultiAssetNotSupported, {
        message:
          'Sending tokens is not supported on Trezor device. Please update your firmware to the latest version.',
      })
    }
    const orderedTokenBundle = orderTokenBundle(tokenBundle)
    return orderedTokenBundle.map(({policyId, assets}) => {
      const tokenAmounts = assets.map(({assetName, quantity}) => ({
        assetNameBytes: assetName,
        amount: quantity.toString(),
      }))
      return {
        policyId,
        tokenAmounts,
      }
    })
  }

  function prepareOutput(output: TxOutput): TrezorOutput {
    const tokenBundle = prepareTokenBundle(output.tokenBundle)
    return output.isChange === false
      ? {
        address: output.address,
        amount: `${output.coins}`,
        tokenBundle,
      }
      : {
        amount: `${output.coins}`,
        addressParameters: {
          addressType: AddressTypes.BASE, // TODO: retrieve from the address
          path: output.spendingPath,
          stakingPath: output.stakingPath,
        },
        tokenBundle,
      }
  }

  function prepareStakepoolRelays(relays: TxStakepoolRelay[]) {
    return relays.map((relay) => {
      switch (relay.type) {
        case TxRelayType.SINGLE_HOST_IP:
          return {
            type: relay.type,
            ipv4Address: relay.params.ipv4,
            ipv6Address: relay.params.ipv6,
            port: relay.params.portNumber,
          }
        case TxRelayType.SINGLE_HOST_NAME:
          return {
            type: relay.type,
            port: relay.params.portNumber,
            hostName: relay.params.dnsName,
          }
        case TxRelayType.MULTI_HOST_NAME:
          return {
            type: relay.type,
            hostName: relay.params.dnsName,
          }
        default:
          throw new UnexpectedError(UnexpectedErrorReason.InvalidRelayType)
      }
    })
  }

  function preparePoolRegistrationCertificate(
    certificate: TxStakepoolRegistrationCert,
    path: BIP32Path
  ): TrezorTxCertificate {
    const {type, poolRegistrationParams} = certificate
    const {data} = bech32.decode(certificate.stakingAddress)
    const owners = certificate.poolRegistrationParams.poolOwners.map((owner) => {
      // TODO: helper function stakingAddress2StakingKeyHash
      return !Buffer.compare(Buffer.from(owner.stakingKeyHashHex, 'hex'), data.slice(1))
        ? {stakingKeyPath: path}
        : {stakingKeyHash: owner.stakingKeyHashHex}
    })
    if (!owners.some((owner) => owner.stakingKeyPath)) {
      throw new InternalError(InternalErrorReason.MissingOwner, {
        message: 'This HW device is not an owner of the pool stated in registration certificate.',
      })
    }
    return {
      type,
      poolParameters: {
        poolId: poolRegistrationParams.poolKeyHashHex,
        vrfKeyHash: poolRegistrationParams.vrfKeyHashHex,
        pledge: poolRegistrationParams.pledgeStr,
        cost: poolRegistrationParams.costStr,
        margin: {
          numerator: poolRegistrationParams.margin.numeratorStr,
          denominator: poolRegistrationParams.margin.denominatorStr,
        },
        rewardAccount: encodeAddress(Buffer.from(poolRegistrationParams.rewardAccountHex, 'hex')),
        owners,
        relays: prepareStakepoolRelays(poolRegistrationParams.relays),
        metadata: poolRegistrationParams.metadata
          ? {
            url: poolRegistrationParams.metadata.metadataUrl,
            hash: poolRegistrationParams.metadata.metadataHashHex,
          }
          : null,
      },
    }
  }

  function prepareStakingKeyRegistrationCertificate(
    certificate: TxStakingKeyRegistrationCert,
    path: BIP32Path
  ): TrezorTxCertificate {
    return {
      type: certificate.type,
      path,
    }
  }

  function prepareStakingKeyDeregistrationCertificate(
    certificate: TxStakingKeyDeregistrationCert,
    path: BIP32Path
  ): TrezorTxCertificate {
    return {
      type: certificate.type,
      path,
    }
  }

  function prepareDelegationCertificate(
    certificate: TxDelegationCert,
    path: BIP32Path
  ): TrezorTxCertificate {
    return {
      type: certificate.type,
      path,
      pool: certificate.poolHash,
    }
  }

  function prepareCertificate(
    certificate: TxCertificate,
    addressToAbsPathMapper: AddressToPathMapper
  ): TrezorTxCertificate {
    const path = addressToAbsPathMapper(certificate.stakingAddress)
    switch (certificate.type) {
      case CertificateType.STAKING_KEY_REGISTRATION:
        return prepareStakingKeyRegistrationCertificate(certificate, path)
      case CertificateType.STAKING_KEY_DEREGISTRATION:
        return prepareStakingKeyDeregistrationCertificate(certificate, path)
      case CertificateType.DELEGATION:
        return prepareDelegationCertificate(certificate, path)
      case CertificateType.STAKEPOOL_REGISTRATION:
        return preparePoolRegistrationCertificate(certificate, path)
      default:
        throw new UnexpectedError(UnexpectedErrorReason.InvalidCertificateType)
    }
  }

  function prepareWithdrawal(
    withdrawal: TxWithdrawal,
    addressToAbsPathMapper: AddressToPathMapper
  ): TrezorWithdrawal {
    return {
      path: addressToAbsPathMapper(withdrawal.stakingAddress),
      amount: `${withdrawal.rewards}`,
    }
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
    const fee = `${txAux.fee}`
    const ttl = `${txAux.ttl}`
    const withdrawals = txAux.withdrawals.map((withdrawal) =>
      prepareWithdrawal(withdrawal, addressToAbsPathMapper)
    )

    const validityIntervalStart = txAux.validityIntervalStart
      ? `${txAux.validityIntervalStart}`
      : null

    const response: TrezorSignTxResponse = await TrezorConnect.cardanoSignTransaction(
      removeNullFields({
        inputs,
        outputs,
        protocolMagic: network.protocolMagic,
        fee,
        ttl,
        networkId: network.networkId,
        certificates,
        withdrawals,
        validityIntervalStart,
      })
    )

    if (response.success === false) {
      debugLog(response)
      throw new InternalError(InternalErrorReason.TrezorSignTxError, {
        message: response.payload.error,
      })
    }

    if (response.payload.hash !== txAux.getId()) {
      throw new InternalError(InternalErrorReason.TxSerializationError, {
        message: 'Tx serialization mismatch between Trezor and Adalite',
      })
    }

    return {
      txHash: response.payload.hash,
      txBody: response.payload.serializedTx,
    }
  }

  async function witnessPoolRegTx(
    txAux: TxAux,
    addressToAbsPathMapper: AddressToPathMapper
  ): Promise<CborizedCliWitness> {
    const txSigned = await signTx(txAux, addressToAbsPathMapper)
    return cborizeCliWitness(txSigned)
  }

  function getWalletSecret(): void {
    throw new UnexpectedError(UnexpectedErrorReason.UnsupportedOperationError, {
      message: 'Unsupported operation!',
    })
  }

  function getDerivationScheme() {
    return derivationScheme
  }

  return {
    getWalletSecret,
    getDerivationScheme,
    signTx,
    witnessPoolRegTx,
    displayAddressForPath,
    deriveXpub,
    isHwWallet,
    getWalletName,
    _sign: sign,
    network,
    ensureFeatureIsSupported,
    isFeatureSupported,
    getHdPassphrase,
    getVersion,
  }
}

export default ShelleyTrezorCryptoProvider
