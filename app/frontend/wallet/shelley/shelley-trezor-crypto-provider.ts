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
  CryptoProviderType,
  Network,
  TxAuxiliaryData,
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
} from '../types'
import {TxSigned, TxAux, CborizedCliWitness, FinalizedAuxiliaryDataTx} from './types'
import {encodeAddress} from './helpers/addresses'
import {TxRelayType, TxStakepoolRelay} from './helpers/poolCertificateUtils'
import {
  cborizeCliWitness,
  cborizeTxAuxiliaryVotingData,
  cborizeTxWitnesses,
  ShelleySignedTransactionStructured,
  ShelleyTxAux,
} from './shelley-transaction'
import {removeNullFields} from '../../helpers/removeNullFiels'
import {orderTokenBundle} from '../helpers/tokenFormater'
import assertUnreachable from '../../helpers/assertUnreachable'
import TrezorConnect, * as TrezorTypes from 'trezor-connect'
import * as assert from 'assert'
import {encodeCbor} from '../helpers/cbor'

type CryptoProviderParams = {
  network: Network
  config: any
}

const ShelleyTrezorCryptoProvider = async ({
  network,
  config,
}: CryptoProviderParams): Promise<CryptoProvider> => {
  const derivationScheme = derivationSchemes.v2

  TrezorConnect.manifest({
    email: ADALITE_SUPPORT_EMAIL,
    appUrl: config.ADALITE_SERVER_URL,
  })

  const getTrezorVersion = async (): Promise<any> => {
    const {payload} = await TrezorConnect.getFeatures()
    const isSuccessful = (value: any): value is TrezorTypes.Features => !value.error

    if (!isSuccessful(payload)) {
      throw new InternalError(InternalErrorReason.TrezorError, {message: payload.error})
    }

    const {major_version: major, minor_version: minor, patch_version: patch} = payload
    return {major, minor, patch}
  }

  const version = await getTrezorVersion()

  const getVersion = (): string => `${version.major}.${version.minor}.${version.patch}`

  const getType = () => CryptoProviderType.TREZOR

  const deriveXpub = CachedDeriveXpubFactory(
    derivationScheme,
    config.shouldExportPubKeyBulk,
    async (absDerivationPaths: BIP32Path[]) => {
      const bundle = absDerivationPaths.map((path: BIP32Path) => ({path, showOnTrezor: false}))
      const response = await TrezorConnect.cardanoGetPublicKey({
        bundle,
      })

      const isSuccessful = (value: any): value is TrezorTypes.CardanoPublicKey[] => !value.error

      if (!isSuccessful(response.payload)) {
        throw new InternalError(InternalErrorReason.TrezorError, {message: response.payload.error})
      }
      return response.payload.map(({publicKey}) => Buffer.from(publicKey, 'hex'))
    }
  )

  function isFeatureSupported(feature: CryptoProviderFeature): boolean {
    return TREZOR_VERSIONS[feature]
      ? hasRequiredVersion(version, TREZOR_VERSIONS[feature])
      : hasRequiredVersion(version, TREZOR_VERSIONS[CryptoProviderFeature.MINIMAL])
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
    stakingPath: BIP32Path
  ): Promise<void> {
    const addressParameters: TrezorTypes.CardanoAddressParameters = {
      addressType: AddressTypes.BASE, // TODO: retrieve from address
      path: absDerivationPath,
      stakingPath,
    }
    const response = await TrezorConnect.cardanoGetAddress({
      addressParameters,
      networkId: network.networkId,
      protocolMagic: network.protocolMagic,
      showOnTrezor: true,
    })
    if (response.success === false) {
      throw new InternalError(InternalErrorReason.TrezorError, {message: response.payload.error})
    }
  }

  function prepareInput(
    input: TxInput,
    addressToAbsPathMapper: AddressToPathMapper
  ): TrezorTypes.CardanoInput {
    return {
      ...(input.address && {path: addressToAbsPathMapper(input.address)}),
      prev_hash: input.txHash,
      prev_index: input.outputIndex,
    }
  }

  const prepareTokenBundle = (
    tokenBundle: TokenBundle
  ): TrezorTypes.CardanoAssetGroup[] | undefined => {
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

  function prepareOutput(output: TxOutput): TrezorTypes.CardanoOutput {
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

  function prepareStakepoolRelays(relays: TxStakepoolRelay[]): TrezorTypes.CardanoPoolRelay[] {
    return relays.map((relay) => {
      switch (relay.type) {
        case TxRelayType.SINGLE_HOST_IP:
          return {
            type: relay.type as number,
            ipv4Address: relay.params.ipv4,
            ipv6Address: relay.params.ipv6,
            port: relay.params.portNumber,
          }
        case TxRelayType.SINGLE_HOST_NAME:
          return {
            type: relay.type as number,
            port: relay.params.portNumber,
            hostName: relay.params.dnsName,
          }
        case TxRelayType.MULTI_HOST_NAME:
          return {
            type: relay.type as number,
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
  ): TrezorTypes.CardanoCertificate {
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
      type: type as number,
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
        // @ts-expect-error - trezor types incorrectly enforce pool metadata to be non-null
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
  ): TrezorTypes.CardanoCertificate {
    return {
      type: certificate.type as number,
      path,
    }
  }

  function prepareStakingKeyDeregistrationCertificate(
    certificate: TxStakingKeyDeregistrationCert,
    path: BIP32Path
  ): TrezorTypes.CardanoCertificate {
    return {
      type: certificate.type as number,
      path,
    }
  }

  function prepareDelegationCertificate(
    certificate: TxDelegationCert,
    path: BIP32Path
  ): TrezorTypes.CardanoCertificate {
    return {
      type: certificate.type as number,
      path,
      pool: certificate.poolHash,
    }
  }

  function prepareCertificate(
    certificate: TxCertificate,
    addressToAbsPathMapper: AddressToPathMapper
  ): TrezorTypes.CardanoCertificate {
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
  ): TrezorTypes.CardanoWithdrawal {
    return {
      path: addressToAbsPathMapper(withdrawal.stakingAddress),
      amount: `${withdrawal.rewards}`,
    }
  }

  const prepareByronWitness = (witness: TrezorTypes.CardanoSignedTxWitness): TxByronWitness => {
    const publicKey = Buffer.from(witness.pubKey, 'hex')
    assert(witness.chainCode != null)
    const chainCode = Buffer.from(witness.chainCode, 'hex')
    // only v1 witnesses has address atributes
    // since trezor is v2 they are always {}
    const addressAttributes = encodeCbor({})
    const signature = Buffer.from(witness.signature, 'hex')
    return {
      publicKey,
      signature,
      chainCode,
      addressAttributes,
    }
  }

  const prepareShelleyWitness = (witness: TrezorTypes.CardanoSignedTxWitness): TxShelleyWitness => {
    const publicKey = Buffer.from(witness.pubKey, 'hex')
    const signature = Buffer.from(witness.signature, 'hex')
    return {
      publicKey,
      signature,
    }
  }

  const prepareWitnesses = (witnesses: TrezorTypes.CardanoSignedTxWitness[]) => {
    const shelleyWitnesses: TxShelleyWitness[] = []
    const byronWitnesses: TxByronWitness[] = []
    witnesses.forEach((witness) => {
      witness.type === TrezorTypes.CardanoTxWitnessType.SHELLEY_WITNESS
        ? shelleyWitnesses.push(prepareShelleyWitness(witness))
        : byronWitnesses.push(prepareByronWitness(witness))
    })
    return {shelleyWitnesses, byronWitnesses}
  }

  const formatAuxiliaryData = (
    txAuxiliaryData: TxAuxiliaryData
  ): TrezorTypes.CardanoAuxiliaryData => {
    switch (txAuxiliaryData.type) {
      case 'CATALYST_VOTING':
        return {
          catalystRegistrationParameters: {
            votingPublicKey: txAuxiliaryData.votingPubKey,
            stakingPath: txAuxiliaryData.rewardDestinationAddress.stakingPath,
            rewardAddressParameters: {
              addressType: AddressTypes.REWARD,
              path: txAuxiliaryData.rewardDestinationAddress.stakingPath,
            },
            nonce: `${txAuxiliaryData.nonce}`,
          },
        }
      default:
        return assertUnreachable(txAuxiliaryData.type)
    }
  }

  function finalizeTxAuxWithMetadata(
    txAux: TxAux,
    auxiliaryDataSupplement: TrezorTypes.CardanoAuxiliaryDataSupplement | undefined
  ): FinalizedAuxiliaryDataTx {
    if (!txAux.auxiliaryData) {
      return {
        finalizedTxAux: txAux,
        txAuxiliaryData: null,
      }
    }
    switch (txAux.auxiliaryData.type) {
      case 'CATALYST_VOTING':
        assert(auxiliaryDataSupplement && auxiliaryDataSupplement.catalystSignature != null)
        return {
          finalizedTxAux: ShelleyTxAux({
            ...txAux,
            auxiliaryDataHash: auxiliaryDataSupplement.auxiliaryDataHash,
          }),
          txAuxiliaryData: cborizeTxAuxiliaryVotingData(
            txAux.auxiliaryData,
            auxiliaryDataSupplement.catalystSignature
          ),
        }
      default:
        return assertUnreachable(txAux.auxiliaryData.type)
    }
  }

  async function trezorSignTransaction(
    txAux: TxAux,
    addressToAbsPathMapper: AddressToPathMapper,
    signingMode: TrezorTypes.CardanoTxSigningMode
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
      : undefined
    const formattedAuxiliaryData = txAux.auxiliaryData
      ? formatAuxiliaryData(txAux.auxiliaryData)
      : undefined
    const request: TrezorTypes.CommonParams & TrezorTypes.CardanoSignTransaction = {
      signingMode,
      inputs,
      outputs,
      protocolMagic: network.protocolMagic,
      fee,
      ttl,
      networkId: network.networkId,
      certificates,
      withdrawals,
      auxiliaryData: formattedAuxiliaryData,
      validityIntervalStart,
    }
    const response = await TrezorConnect.cardanoSignTransaction(removeNullFields(request))

    if (response.success === false) {
      debugLog(response)
      throw new InternalError(InternalErrorReason.TrezorSignTxError, {
        message: response.payload.error,
      })
    }

    const {finalizedTxAux, txAuxiliaryData} = finalizeTxAuxWithMetadata(
      txAux,
      response.payload.auxiliaryDataSupplement
    )

    if (response.payload.hash !== finalizedTxAux.getId()) {
      throw new InternalError(InternalErrorReason.TxSerializationError, {
        message: 'Tx serialization mismatch between Trezor and Adalite',
      })
    }

    const {shelleyWitnesses, byronWitnesses} = prepareWitnesses(response.payload.witnesses)
    const txWitnesses = cborizeTxWitnesses(byronWitnesses, shelleyWitnesses)
    const structuredTx = ShelleySignedTransactionStructured(
      finalizedTxAux,
      txWitnesses,
      txAuxiliaryData
    )

    return {
      txHash: response.payload.hash,
      txBody: encodeCbor(structuredTx).toString('hex'),
    }
  }

  async function signTx(
    txAux: TxAux,
    addressToAbsPathMapper: AddressToPathMapper
  ): Promise<TxSigned> {
    return await trezorSignTransaction(
      txAux,
      addressToAbsPathMapper,
      TrezorTypes.CardanoTxSigningMode.ORDINARY_TRANSACTION
    )
  }

  async function witnessPoolRegTx(
    txAux: TxAux,
    addressToAbsPathMapper: AddressToPathMapper
  ): Promise<CborizedCliWitness> {
    const txSigned = await trezorSignTransaction(
      txAux,
      addressToAbsPathMapper,
      TrezorTypes.CardanoTxSigningMode.POOL_REGISTRATION_AS_OWNER
    )
    return cborizeCliWitness(txSigned)
  }

  function getWalletSecret(): void {
    throw new UnexpectedError(UnexpectedErrorReason.UnsupportedOperationError, {
      message: 'Operation not supported',
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
    getType,
    _sign: sign,
    network,
    ensureFeatureIsSupported,
    isFeatureSupported,
    getHdPassphrase,
    getVersion,
  }
}

export default ShelleyTrezorCryptoProvider
