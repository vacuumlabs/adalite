// eslint-disable-next-line import/no-unresolved
import CachedDeriveXpubFactory from '../helpers/CachedDeriveXpubFactory'
import {ADALITE_SUPPORT_EMAIL, TREZOR_ERRORS, TREZOR_VERSIONS} from '../constants'
import derivationSchemes from '../helpers/derivation-schemes'
import NamedError from '../../helpers/NamedError'
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
  Token,
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
import {TxSigned, TxAux, CborizedTxWitnesses, CborizedCliWitness} from './types'
import {groupTokensByPolicyId} from '../helpers/tokenFormater'
import * as cbor from 'borc'
import {encodeAddress} from './helpers/addresses'

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

  const getVersion = async (): Promise<any> => {
    // TODO: add return type
    const {payload: features} = await TrezorConnect.getFeatures()
    const {major_version: major, minor_version: minor, patch_version: patch} = features
    return {major, minor, patch}
  }

  const version = await getVersion()

  const isHwWallet = (): boolean => true
  const getWalletName = (): string => 'Trezor' // TODO: return enum

  const deriveXpub = CachedDeriveXpubFactory(
    derivationScheme,
    config.shouldExportPubKeyBulk,
    async (absDerivationPaths: BIP32Path[]) => {
      const bundle = absDerivationPaths.map((path: BIP32Path) => ({path, showOnTrezor: false}))
      const response: TrezorGetPublicKeyResponse = await TrezorConnect.cardanoGetPublicKey({
        bundle,
      })
      if (response.success === false) {
        throw NamedError('TrezorError', {message: response.payload.error})
      }
      return response.payload.map(({publicKey}) => Buffer.from(publicKey, 'hex'))
    }
  )

  function isFeatureSupported(feature: CryptoProviderFeature): boolean {
    return TREZOR_VERSIONS[feature] ? hasRequiredVersion(version, TREZOR_VERSIONS[feature]) : true
  }

  function ensureFeatureIsSupported(feature: CryptoProviderFeature): void {
    if (!isFeatureSupported(feature)) {
      throw NamedError(TREZOR_ERRORS[feature], {
        message: `${version.major}.${version.minor}.${version.patch}`,
      })
    }
  }

  function getHdPassphrase(): void {
    throw NamedError('UnsupportedOperationError', {
      message: 'This operation is not supported on TrezorCryptoProvider!',
    })
  }

  function sign(message: HexString, absDerivationPath: BIP32Path): void {
    throw NamedError('UnsupportedOperationError', {message: 'Operation not supported'})
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
      throw NamedError('TrezorError', {message: response.payload.error})
    }
  }

  function prepareInput(input: TxInput, addressToAbsPathMapper: AddressToPathMapper): TrezorInput {
    return {
      ...(input.address && {path: addressToAbsPathMapper(input.address)}),
      prev_hash: input.txHash,
      prev_index: input.outputIndex,
    }
  }

  const prepareTokenBundle = (tokens: Token[]): TrezorMultiAsset | undefined => {
    // TODO: refactor
    if (tokens.length > 0 && !isFeatureSupported(CryptoProviderFeature.MULTI_ASSET)) {
      throw NamedError('TrezorMultiAssetNotSupported', {
        message:
          'Sending tokens is not supported on Trezor device. Please update your firmware to the latest version.',
      })
    }
    const tokenObject = groupTokensByPolicyId(tokens)
    const tokenBundle = Object.entries(tokenObject).map(([policyId, assets]) => {
      const tokenAmounts = assets.map(({assetName, quantity}) => ({
        assetNameBytes: assetName,
        amount: quantity.toString(),
      }))
      return {
        policyId,
        tokenAmounts,
      }
    })
    return tokenBundle.length > 0 ? tokenBundle : []
  }

  function prepareOutput(output: TxOutput): TrezorOutput {
    const tokenBundle = prepareTokenBundle(output.tokens)
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

  // function prepareStakepoolRegistrationOwners() {

  //   owners: poolRegistrationParams.poolOwners.map((owner) => ({
  //     ...(owner.stakingKeyHashHex && {
  //       stakingKeyHash: owner.stakingKeyHashHex,
  //     }),
  //     ...(owner.stakingPath && {
  //       stakingKeyPath: owner.stakingPath,
  //       stakingKeyHash: undefined,
  //     }),
  //   })),
  // }

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
        relays: poolRegistrationParams.relays.map((relay) => ({
          type: relay.type,
          ...(relay.type === 0 && {
            ipv4Address: relay.params.ipv4,
            ipv6Address: relay.params.ipv6,
          }),
          ...(relay.type < 2 && {port: relay.params.portNumber}),
          ...(relay.type > 0 && {hostName: relay.params.dnsName}),
        })),
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
    certificate: TxStakingKeyRegistrationCert | TxStakingKeyDeregistrationCert,
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
      case CertificateType.DELEGATION:
        return prepareDelegationCertificate(certificate, path)
      case CertificateType.STAKEPOOL_REGISTRATION:
        return preparePoolRegistrationCertificate(certificate, path)
      default:
        throw NamedError('InvalidCertficateType')
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

    const response: TrezorSignTxResponse = await TrezorConnect.cardanoSignTransaction({
      inputs,
      outputs,
      protocolMagic: network.protocolMagic,
      fee,
      ttl,
      networkId: network.networkId,
      certificates,
      withdrawals,
    })

    if (response.success === false) {
      debugLog(response)
      throw NamedError('TrezorSignTxError', {message: response.payload.error})
    }

    if (response.payload.hash !== txAux.getId()) {
      throw NamedError('TxSerializationError', {
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
    // TODO: extract this to function
    const [, witnesses]: [any, CborizedTxWitnesses] = cbor.decode(txSigned.txBody)
    // there can be only one witness since only one signing file was passed
    const [key, [data]] = Array.from(witnesses)[0]
    return [key, data]
  }

  function getWalletSecret(): void {
    throw NamedError('UnsupportedOperationError', {message: 'Unsupported operation!'})
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
  }
}

export default ShelleyTrezorCryptoProvider
