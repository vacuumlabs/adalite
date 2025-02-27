import Transport from '@ledgerhq/hw-transport'
import LedgerTransportWebUsb from '@ledgerhq/hw-transport-webusb'
import LedgerTransportWebHid from '@ledgerhq/hw-transport-webhid'
import Ledger, * as LedgerTypes from '@cardano-foundation/ledgerjs-hw-app-cardano'
import CachedDeriveXpubFactory from '../helpers/CachedDeriveXpubFactory'
import {
  ShelleySignedTransactionStructured,
  cborizeTxWitnesses,
  cborizeCliWitness,
  cborizeTxAuxiliaryVotingData,
  ShelleyTxAux,
} from './shelley-transaction'
import {hasRequiredVersion} from './helpers/version-check'
import {LEDGER_VERSIONS, LEDGER_ERRORS} from '../constants'
import {bech32} from 'cardano-crypto.js'
import {
  bechAddressToHex,
  isShelleyPath,
  isShelleyFormat,
  base58AddressToHex,
  xpub2ChainCode,
  xpub2pub,
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
  Address,
  LedgerTransportType,
  LedgerTransportChoice,
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
  TxVoteDelegationCert,
  TxWithdrawal,
  TxDRepType,
} from '../types'
import {TxSigned, TxAux, CborizedCliWitness, FinalizedAuxiliaryDataTx} from './types'
import {orderTokenBundle} from '../helpers/tokenFormater'
import {
  InternalError,
  InternalErrorReason,
  UnexpectedError,
  UnexpectedErrorReason,
} from '../../errors'
import {TxRelayType, TxStakepoolOwner, TxStakepoolRelay} from './helpers/poolCertificateUtils'
import assertUnreachable from '../../helpers/assertUnreachable'
import * as assert from 'assert'
import {encodeCbor} from '../helpers/cbor'
import {safeAssertUnreachable} from '../../helpers/common'

let _activeTransport: Transport | null
const getLedgerTransport = async (ledgerTransportType: LedgerTransportType): Promise<Transport> => {
  if (_activeTransport != null) {
    /*
     * this is needed for WebHID transport where .create() is not idempotent
     * and requires closing the previous transport first. Relevant e.g. for
     * wallet logout and repeated login
     */
    try {
      await _activeTransport.close()
    } finally {
      _activeTransport = null
    }
  }

  switch (ledgerTransportType) {
    case LedgerTransportChoice.WEB_HID:
      _activeTransport = await LedgerTransportWebHid.create()
      break
    case LedgerTransportChoice.WEB_USB:
      _activeTransport = await LedgerTransportWebUsb.create()
      break
    default:
      return assertUnreachable(ledgerTransportType)
  }
  assert(_activeTransport != null)

  return _activeTransport
}

type CryptoProviderParams = {
  network: Network
  config: any
}

const ShelleyLedgerCryptoProvider = async ({
  network,
  config,
}: CryptoProviderParams): Promise<CryptoProvider> => {
  const transport = await getLedgerTransport(config.ledgerTransportType)
  transport.setExchangeTimeout(config.ADALITE_LOGOUT_AFTER * 1000)
  const ledger = new Ledger(transport)
  const derivationScheme = derivationSchemes.v2

  const {version} = await ledger.getVersion()

  const getVersion = (): string => `${version.major}.${version.minor}.${version.patch}`

  ensureFeatureIsSupported(CryptoProviderFeature.MINIMAL)

  const getType = () => CryptoProviderType.LEDGER

  const exportPublicKeys = async (
    derivationPaths: BIP32Path[]
  ): Promise<LedgerTypes.GetExtendedPublicKeyResponse[]> => {
    if (isFeatureSupported(CryptoProviderFeature.BULK_EXPORT)) {
      return await ledger.getExtendedPublicKeys({paths: derivationPaths})
    }
    const response: LedgerTypes.GetExtendedPublicKeyResponse[] = []
    for (const path of derivationPaths) {
      response.push(await ledger.getExtendedPublicKey({path}))
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
    return LEDGER_VERSIONS[feature]
      ? hasRequiredVersion(version, LEDGER_VERSIONS[feature])
      : hasRequiredVersion(version, LEDGER_VERSIONS[CryptoProviderFeature.MINIMAL])
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
    stakingPath: BIP32Path
  ): Promise<void> {
    try {
      await ledger.showAddress({
        network: {networkId: network.networkId, protocolMagic: network.protocolMagic},
        address: {
          type: LedgerTypes.AddressType.BASE_PAYMENT_KEY_STAKE_KEY,
          params: {
            spendingPath: absDerivationPath,
            stakingPath,
          },
        },
      })
    } catch (err) {
      throw new InternalError(InternalErrorReason.LedgerOperationError, {
        message: `${err.name}: ${err.message}`,
      })
    }
  }

  function getWalletSecret(): void {
    throw new UnexpectedError(UnexpectedErrorReason.UnsupportedOperationError, {
      message: 'Operation not supported',
    })
  }

  function getDerivationScheme(): DerivationScheme {
    return derivationScheme
  }

  function prepareInput(
    input: TxInput,
    addressToAbsPathMapper: AddressToPathMapper
  ): LedgerTypes.TxInput {
    return {
      txHashHex: input.txHash,
      outputIndex: input.outputIndex,
      path: input.address ? addressToAbsPathMapper(input.address) : null,
    }
  }

  const prepareTokenBundle = (tokenBundle: TokenBundle): LedgerTypes.AssetGroup[] => {
    // TODO: refactor, we should check the whole tx against the version beforehand
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
        amount: quantity.toString(),
      }))
      return {
        policyIdHex: policyId,
        tokens,
      }
    })
  }

  function prepareOutput(output: TxOutput): LedgerTypes.TxOutput {
    const tokenBundle = prepareTokenBundle(output.tokenBundle)
    return output.isChange === false
      ? {
        destination: {
          type: LedgerTypes.TxOutputDestinationType.THIRD_PARTY,
          params: {
            addressHex: isShelleyFormat(output.address)
              ? bechAddressToHex(output.address)
              : base58AddressToHex(output.address),
          },
        },
        amount: output.coins.toString(),
        tokenBundle,
      }
      : {
        destination: {
          type: LedgerTypes.TxOutputDestinationType.DEVICE_OWNED,
          params: {
            type: LedgerTypes.AddressType.BASE_PAYMENT_KEY_STAKE_KEY,
            params: {
              spendingPath: output.spendingPath,
              stakingPath: output.stakingPath,
            },
          },
        },
        amount: output.coins.toString(),
        tokenBundle,
      }
  }

  function prepareStakingKeyRegistrationCertificate(
    certificate: TxStakingKeyRegistrationCert,
    path: BIP32Path
  ): LedgerTypes.Certificate {
    return {
      type: LedgerTypes.CertificateType.STAKE_REGISTRATION,
      params: {
        stakeCredential: {
          type: LedgerTypes.CredentialParamsType.KEY_PATH,
          keyPath: path,
        },
      },
    }
  }

  function prepareStakingKeyDeregistrationCertificate(
    certificate: TxStakingKeyDeregistrationCert,
    path: BIP32Path
  ): LedgerTypes.Certificate {
    return {
      type: LedgerTypes.CertificateType.STAKE_DEREGISTRATION,
      params: {
        stakeCredential: {
          type: LedgerTypes.CredentialParamsType.KEY_PATH,
          keyPath: path,
        },
      },
    }
  }

  function prepareDelegationCertificate(
    certificate: TxDelegationCert,
    path: BIP32Path
  ): LedgerTypes.Certificate {
    return {
      type: LedgerTypes.CertificateType.STAKE_DELEGATION,
      params: {
        poolKeyHashHex: certificate.poolHash,
        stakeCredential: {
          type: LedgerTypes.CredentialParamsType.KEY_PATH,
          keyPath: path,
        },
      },
    }
  }

  function prepareRelays(relays: TxStakepoolRelay[]): LedgerTypes.Relay[] {
    return relays.map((relay) => {
      switch (relay.type) {
        case TxRelayType.SINGLE_HOST_IP:
          return {
            type: LedgerTypes.RelayType.SINGLE_HOST_IP_ADDR,
            params: relay.params,
          }
        case TxRelayType.SINGLE_HOST_NAME:
          return {
            type: LedgerTypes.RelayType.SINGLE_HOST_HOSTNAME,
            params: relay.params,
          }
        case TxRelayType.MULTI_HOST_NAME:
          return {
            type: LedgerTypes.RelayType.MULTI_HOST,
            params: relay.params,
          }
        default:
          throw new UnexpectedError(UnexpectedErrorReason.InvalidRelayType)
      }
    })
  }

  function preparePoolOwners(
    stakepoolOwners: TxStakepoolOwner[],
    stakingAddress: Address,
    path: BIP32Path
  ): LedgerTypes.PoolOwner[] {
    const {data: stakingAddressBuff} = bech32.decode(stakingAddress)
    const poolOwners: LedgerTypes.PoolOwner[] = stakepoolOwners.map((owner) => {
      // TODO: helper function for slicing first bit from staking address so its stakingKeyHash
      return !Buffer.compare(
        Buffer.from(owner.stakingKeyHashHex, 'hex'),
        stakingAddressBuff.slice(1)
      )
        ? {
          type: LedgerTypes.PoolOwnerType.DEVICE_OWNED,
          params: {stakingPath: path},
        }
        : {
          type: LedgerTypes.PoolOwnerType.THIRD_PARTY,
          params: {stakingKeyHashHex: owner.stakingKeyHashHex},
        }
    })
    if (!poolOwners.some((owner) => owner.type === LedgerTypes.PoolOwnerType.DEVICE_OWNED)) {
      throw new InternalError(InternalErrorReason.MissingOwner, {
        message: 'This HW device is not an owner of the pool stated in registration certificate.',
      })
    }
    return poolOwners
  }

  function prepareStakepoolRegistrationCertificate(
    certificate: TxStakepoolRegistrationCert,
    path: BIP32Path
  ): LedgerTypes.Certificate {
    const {stakingAddress, poolRegistrationParams} = certificate
    const poolOwners = preparePoolOwners(poolRegistrationParams.poolOwners, stakingAddress, path)
    const margin = {
      numerator: poolRegistrationParams.margin.numeratorStr,
      denominator: poolRegistrationParams.margin.denominatorStr,
    }

    const relays = prepareRelays(poolRegistrationParams.relays)
    return {
      type: LedgerTypes.CertificateType.STAKE_POOL_REGISTRATION,
      params: {
        ...poolRegistrationParams,
        poolKey: {
          type: LedgerTypes.PoolKeyType.THIRD_PARTY,
          params: {
            keyHashHex: poolRegistrationParams.poolKeyHashHex,
          },
        },
        rewardAccount: {
          type: LedgerTypes.PoolRewardAccountType.THIRD_PARTY,
          params: {
            rewardAccountHex: poolRegistrationParams.rewardAccountHex,
          },
        },
        poolOwners,
        margin,
        pledge: poolRegistrationParams.pledgeStr,
        cost: poolRegistrationParams.costStr,
        relays,
        metadata: poolRegistrationParams.metadata,
      },
    }
  }

  type SupportedTxVoteDelegationCert = TxVoteDelegationCert & {
    dRep: {type: TxDRepType.ALWAYS_ABSTAIN}
  }
  function prepareVoteDelegationCertificate(
    certificate: SupportedTxVoteDelegationCert,
    path: BIP32Path
  ): LedgerTypes.Certificate {
    assert(certificate.dRep.type === TxDRepType.ALWAYS_ABSTAIN)
    return {
      type: LedgerTypes.CertificateType.VOTE_DELEGATION,
      params: {
        stakeCredential: {
          type: LedgerTypes.CredentialParamsType.KEY_PATH,
          keyPath: path,
        },
        dRep: {
          type: LedgerTypes.DRepParamsType.ABSTAIN,
        },
      },
    }
  }

  function prepareCertificate(
    certificate: TxCertificate,
    addressToAbsPathMapper: AddressToPathMapper
  ): LedgerTypes.Certificate {
    const path = addressToAbsPathMapper(certificate.stakingAddress)
    switch (certificate.type) {
      case CertificateType.STAKING_KEY_REGISTRATION:
        return prepareStakingKeyRegistrationCertificate(certificate, path)
      case CertificateType.STAKING_KEY_DEREGISTRATION:
        return prepareStakingKeyDeregistrationCertificate(certificate, path)
      case CertificateType.DELEGATION:
        return prepareDelegationCertificate(certificate, path)
      case CertificateType.STAKEPOOL_REGISTRATION:
        return prepareStakepoolRegistrationCertificate(certificate, path)
      case CertificateType.VOTE_DELEGATION:
        return prepareVoteDelegationCertificate(certificate, path)
      default:
        return safeAssertUnreachable(certificate)
    }
  }

  function prepareWithdrawal(
    withdrawal: TxWithdrawal,
    addressToAbsPathMapper: AddressToPathMapper
  ): LedgerTypes.Withdrawal {
    return {
      stakeCredential: {
        type: LedgerTypes.CredentialParamsType.KEY_PATH,
        keyPath: addressToAbsPathMapper(withdrawal.stakingAddress),
      },
      amount: `${withdrawal.rewards}`,
    }
  }

  const prepareByronWitness = async (witness: LedgerTypes.Witness): Promise<TxByronWitness> => {
    const xpub = await deriveXpub(witness.path)
    const publicKey = xpub2pub(xpub)
    const chainCode = xpub2ChainCode(xpub)
    // only v1 witnesses has address atributes
    // since ledger is v2 they are always {}
    const addressAttributes = encodeCbor({})
    const signature = Buffer.from(witness.witnessSignatureHex, 'hex')
    return {
      publicKey,
      signature,
      chainCode,
      addressAttributes,
    }
  }

  const prepareShelleyWitness = async (witness: LedgerTypes.Witness): Promise<TxShelleyWitness> => {
    const xpub = await deriveXpub(witness.path)
    const publicKey = xpub2pub(xpub)
    const signature = Buffer.from(witness.witnessSignatureHex, 'hex')
    return {
      publicKey,
      signature,
    }
  }

  const prepareWitnesses = async (ledgerWitnesses: LedgerTypes.Witness[]) => {
    const _shelleyWitnesses: Array<Promise<TxShelleyWitness>> = []
    const _byronWitnesses: Array<Promise<TxByronWitness>> = []
    ledgerWitnesses.forEach((witness) => {
      isShelleyPath(witness.path)
        ? _shelleyWitnesses.push(prepareShelleyWitness(witness))
        : _byronWitnesses.push(prepareByronWitness(witness))
    })
    const shelleyWitnesses: TxShelleyWitness[] = await Promise.all(_shelleyWitnesses)
    const byronWitnesses: TxByronWitness[] = await Promise.all(_byronWitnesses)
    return {shelleyWitnesses, byronWitnesses}
  }

  const formatAuxiliaryData = (txAuxiliaryData: TxAuxiliaryData): LedgerTypes.TxAuxiliaryData => {
    switch (txAuxiliaryData.type) {
      case 'CATALYST_VOTING':
        return {
          type: LedgerTypes.TxAuxiliaryDataType.CIP36_REGISTRATION,
          params: {
            format: LedgerTypes.CIP36VoteRegistrationFormat.CIP_15,
            voteKeyHex: txAuxiliaryData.votingPubKey,
            stakingPath: txAuxiliaryData.rewardDestinationAddress.stakingPath,
            paymentDestination: {
              type: LedgerTypes.TxOutputDestinationType.DEVICE_OWNED,
              params: {
                type: LedgerTypes.AddressType.BASE_PAYMENT_KEY_STAKE_KEY,
                params: {
                  stakingPath: txAuxiliaryData.rewardDestinationAddress.stakingPath,
                  spendingPath: txAuxiliaryData.rewardDestinationAddress.spendingPath,
                },
              },
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
    auxiliaryDataSupplement: LedgerTypes.TxAuxiliaryDataSupplement | null
  ): FinalizedAuxiliaryDataTx {
    if (!txAux.auxiliaryData) {
      return {
        finalizedTxAux: txAux,
        txAuxiliaryData: null,
      }
    }
    switch (txAux.auxiliaryData.type) {
      case 'CATALYST_VOTING':
        assert(auxiliaryDataSupplement != null)
        return {
          finalizedTxAux: ShelleyTxAux({
            ...txAux,
            auxiliaryDataHash: auxiliaryDataSupplement.auxiliaryDataHashHex,
          }),
          txAuxiliaryData: cborizeTxAuxiliaryVotingData(
            txAux.auxiliaryData,
            auxiliaryDataSupplement.cip36VoteRegistrationSignatureHex
          ),
        }
      default:
        return assertUnreachable(txAux.auxiliaryData.type)
    }
  }

  async function ledgerSignTransaction(
    txAux: TxAux,
    addressToAbsPathMapper: AddressToPathMapper,
    signingMode: LedgerTypes.TransactionSigningMode
  ): Promise<TxSigned> {
    const inputs = txAux.inputs.map((input) => prepareInput(input, addressToAbsPathMapper))
    const outputs = txAux.outputs.map((output) => prepareOutput(output))
    const certificates = txAux.certificates.map((certificate) =>
      prepareCertificate(certificate, addressToAbsPathMapper)
    )
    const feeStr = `${txAux.fee}`
    const withdrawals = txAux.withdrawals.map((withdrawal) =>
      prepareWithdrawal(withdrawal, addressToAbsPathMapper)
    )

    const validityIntervalStart = txAux.validityIntervalStart
      ? `${txAux.validityIntervalStart}`
      : null
    const formattedAuxiliaryData = txAux.auxiliaryData
      ? formatAuxiliaryData(txAux.auxiliaryData)
      : null
    const response = await ledger.signTransaction({
      signingMode,
      tx: {
        network: {networkId: network.networkId, protocolMagic: network.protocolMagic},
        inputs,
        outputs,
        fee: feeStr,
        ttl: txAux.ttl?.toString(),
        certificates,
        withdrawals,
        auxiliaryData: formattedAuxiliaryData,
        validityIntervalStart,
      },
    })

    const {finalizedTxAux, txAuxiliaryData} = finalizeTxAuxWithMetadata(
      txAux,
      response.auxiliaryDataSupplement
    )

    if (response.txHashHex !== finalizedTxAux.getId()) {
      throw new InternalError(InternalErrorReason.TxSerializationError, {
        message: 'Tx serialization mismatch between Ledger and Adalite',
      })
    }

    const {shelleyWitnesses, byronWitnesses} = await prepareWitnesses(response.witnesses)
    const txWitnesses = cborizeTxWitnesses(byronWitnesses, shelleyWitnesses)
    const structuredTx = ShelleySignedTransactionStructured(
      finalizedTxAux,
      txWitnesses,
      txAuxiliaryData
    )

    return {
      txHash: response.txHashHex,
      txBody: encodeCbor(structuredTx).toString('hex'),
    }
  }

  async function signTx(
    txAux: TxAux,
    addressToAbsPathMapper: AddressToPathMapper
  ): Promise<TxSigned> {
    return await ledgerSignTransaction(
      txAux,
      addressToAbsPathMapper,
      LedgerTypes.TransactionSigningMode.ORDINARY_TRANSACTION
    )
  }

  async function witnessPoolRegTx(
    txAux: TxAux,
    addressToAbsPathMapper: AddressToPathMapper
  ): Promise<CborizedCliWitness> {
    const txSigned = await ledgerSignTransaction(
      txAux,
      addressToAbsPathMapper,
      LedgerTypes.TransactionSigningMode.POOL_REGISTRATION_AS_OWNER
    )
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
    getType,
    _sign: sign,
    isFeatureSupported,
    ensureFeatureIsSupported,
    getVersion,
  }
}

export default ShelleyLedgerCryptoProvider
