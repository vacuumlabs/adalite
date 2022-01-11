import {
  CardanoAssetGroup,
  CardanoInput,
  CardanoOutput,
  CardanoCertificate,
  CardanoShelleyWitness,
  BitBox02API,
} from 'bitbox02-api'
import * as cbor from 'borc'
import CachedDeriveXpubFactory from '../helpers/CachedDeriveXpubFactory'
import {ShelleySignedTransactionStructured, cborizeTxWitnesses} from './shelley-transaction'
import {orderTokenBundle} from '../helpers/tokenFormater'
import {hasRequiredVersion} from './helpers/version-check'
import {BITBOX02_ERRORS, BITBOX02_VERSIONS} from '../constants'

import debugLog from '../../helpers/debugLog'
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
  CryptoProviderType,
  Network,
  NetworkId,
  TxCertificate,
  TxInput,
  TxOutput,
  TxShelleyWitness,
} from '../types'
import {TxSigned, TxAux, CborizedCliWitness} from './types'
import {
  InternalError,
  InternalErrorReason,
  UnexpectedError,
  UnexpectedErrorReason,
} from '../../errors'

let _activeBitBox02: BitBox02API | null = null

type CryptoProviderParams = {
  network: Network
  config: any
}

const ShelleyBitBox02CryptoProvider = async ({
  network,
  config,
}: CryptoProviderParams): Promise<CryptoProvider> => {
  // loading the library asynchronously because it's big (>5MB) and it's needed
  // just for BitBox02 users
  const bitbox02API = await import(/* webpackChunkName: "bitbox02-api" */ 'bitbox02-api')
  const bitbox02Constants = bitbox02API.constants
  if (_activeBitBox02 !== null) {
    try {
      _activeBitBox02.close()
    } finally {
      _activeBitBox02 = null
    }
  }
  async function withDevice<T>(f: (BitBox02API) => Promise<T>): Promise<T> {
    if (_activeBitBox02 !== null) {
      return await f(_activeBitBox02)
    }
    try {
      const devicePath = await bitbox02API.getDevicePath()
      _activeBitBox02 = new bitbox02API.BitBox02API(devicePath)
      await _activeBitBox02.connect(
        (pairingCode) => {
          config.bitbox02OnPairingCode(pairingCode)
        },
        () => {
          config.bitbox02OnPairingCode(null)
          return Promise.resolve()
        },
        (attestationResult) => {
          debugLog(`BitBox02 attestation: ${attestationResult}`)
        },
        () => {
          _activeBitBox02 = null
        },
        (status) => {
          if (status === bitbox02Constants.Status.PairingFailed) {
            config.bitbox02OnPairingCode(null)
          }
        }
      )

      if (_activeBitBox02.firmware().Product() !== bitbox02Constants.Product.BitBox02Multi) {
        throw new Error('Unsupported device')
      }

      return await f(_activeBitBox02)
    } catch (err) {
      debugLog(err)
      if (_activeBitBox02 !== null) {
        try {
          _activeBitBox02.close()
        } finally {
          _activeBitBox02 = null
        }
      }
      throw new InternalError(InternalErrorReason.BitBox02Error, {
        message: err,
      })
    }
  }

  const derivationScheme = derivationSchemes.v2

  const bb02Network = {
    [NetworkId.MAINNET]: bitbox02Constants.messages.CardanoNetwork.CardanoMainnet,
    [NetworkId.TESTNET]: bitbox02Constants.messages.CardanoNetwork.CardanoTestnet,
  }[network.networkId]

  const version = await withDevice((bitbox02: BitBox02API) => {
    const version = bitbox02.version().split('.')
    return Promise.resolve({
      major: version[0],
      minor: version[1],
      patch: version[2],
    })
  })

  const getVersion = (): string => `${version.major}.${version.minor}.${version.patch}`

  ensureFeatureIsSupported(CryptoProviderFeature.MINIMAL)

  const getType = () => CryptoProviderType.BITBOX02

  const deriveXpub = CachedDeriveXpubFactory(
    derivationScheme,
    config.shouldExportPubKeyBulk && isFeatureSupported(CryptoProviderFeature.BULK_EXPORT),
    async (derivationPaths: BIP32Path[]) => {
      return await withDevice(async (bitbox02: BitBox02API) => {
        const xpubs: Uint8Array[] = await bitbox02.cardanoXPubs(derivationPaths)
        return xpubs.map(Buffer.from)
      })
    },
    isFeatureSupported(CryptoProviderFeature.BYRON)
  )

  function isFeatureSupported(feature: CryptoProviderFeature): boolean {
    switch (feature) {
      case CryptoProviderFeature.BYRON:
      case CryptoProviderFeature.POOL_OWNER:
      case CryptoProviderFeature.VOTING:
        return false
      default:
        return hasRequiredVersion(
          version,
          BITBOX02_VERSIONS[feature] ?? BITBOX02_VERSIONS[CryptoProviderFeature.MINIMAL]
        )
    }
  }

  function ensureFeatureIsSupported(feature: CryptoProviderFeature): void {
    if (!isFeatureSupported(feature)) {
      throw new InternalError(
        BITBOX02_ERRORS[feature] ?? BITBOX02_ERRORS[CryptoProviderFeature.MINIMAL],
        {message: `${version.major}.${version.minor}.${version.patch}`}
      )
    }
  }

  function getHdPassphrase(): void {
    throw new UnexpectedError(UnexpectedErrorReason.UnsupportedOperationError, {
      message: 'Operation not supported',
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
    await withDevice(async (bitbox02: BitBox02API) => {
      await bitbox02.cardanoAddress(bb02Network, {
        pkhSkh: {
          keypathPayment: absDerivationPath,
          keypathStake: stakingPath,
        },
      })
    })
  }

  function getWalletSecret(): void {
    throw new UnexpectedError(UnexpectedErrorReason.UnsupportedOperationError, {
      message: 'Operation not supported',
    })
  }

  function getDerivationScheme(): DerivationScheme {
    return derivationScheme
  }

  function prepareInput(input: TxInput, addressToAbsPathMapper: AddressToPathMapper): CardanoInput {
    return {
      keypath: addressToAbsPathMapper(input.address),
      prevOutHash: Buffer.from(input.txHash, 'hex'),
      prevOutIndex: input.outputIndex,
    }
  }

  function prepareTokenBundle(tokenBundle: TokenBundle): CardanoAssetGroup[] {
    if (tokenBundle.length > 0 && !isFeatureSupported(CryptoProviderFeature.MULTI_ASSET)) {
      throw new InternalError(InternalErrorReason.BitBox02MultiAssetNotSupported, {
        message: 'Please update your BitBox02 firmware for token support.',
      })
    }
    const orderedTokenBundle = orderTokenBundle(tokenBundle)
    return orderedTokenBundle.map(({policyId, assets}) => {
      const tokens = assets.map(({assetName, quantity}) => ({
        assetName: Buffer.from(assetName, 'hex'),
        value: quantity.toString(),
      }))
      return {
        policyId: Buffer.from(policyId, 'hex'),
        tokens,
      }
    })
  }

  function prepareOutput(output: TxOutput): CardanoOutput {
    const assetGroups = prepareTokenBundle(output.tokenBundle)
    return {
      encodedAddress: output.address,
      value: output.coins.toString(),
      scriptConfig: output.isChange
        ? {
          pkhSkh: {
            keypathPayment: output.spendingPath,
            keypathStake: output.stakingPath,
          },
        }
        : undefined,
      assetGroups,
    }
  }

  function prepareCertificate(
    certificate: TxCertificate,
    addressToAbsPathMapper: AddressToPathMapper
  ): CardanoCertificate {
    switch (certificate.type) {
      case CertificateType.STAKING_KEY_REGISTRATION:
        return {
          stakeRegistration: {
            keypath: addressToAbsPathMapper(certificate.stakingAddress),
          },
        }
      case CertificateType.STAKING_KEY_DEREGISTRATION:
        return {
          stakeDeregistration: {
            keypath: addressToAbsPathMapper(certificate.stakingAddress),
          },
        }
      case CertificateType.DELEGATION:
        return {
          stakeDelegation: {
            keypath: addressToAbsPathMapper(certificate.stakingAddress),
            poolKeyhash: Buffer.from(certificate.poolHash, 'hex'),
          },
        }
      case CertificateType.STAKEPOOL_REGISTRATION:
        throw new UnexpectedError(UnexpectedErrorReason.UnsupportedOperationError, {
          message: 'Stakepool registration not supported',
        })
      default:
        throw new UnexpectedError(UnexpectedErrorReason.InvalidCertificateType)
    }
  }

  function prepareShelleyWitness(witness: CardanoShelleyWitness): TxShelleyWitness {
    return {
      publicKey: Buffer.from(witness.publicKey),
      signature: Buffer.from(witness.signature),
    }
  }

  async function signTx(
    txAux: TxAux,
    addressToAbsPathMapper: AddressToPathMapper
  ): Promise<TxSigned> {
    const inputs = txAux.inputs.map((input) => prepareInput(input, addressToAbsPathMapper))
    const outputs = txAux.outputs.map(prepareOutput)
    const withdrawals = txAux.withdrawals.map((withdrawal) => ({
      keypath: addressToAbsPathMapper(withdrawal.stakingAddress),
      value: withdrawal.rewards.toString(),
    }))
    const certificates = txAux.certificates.map((certificate) =>
      prepareCertificate(certificate, addressToAbsPathMapper)
    )
    const validityIntervalStart = txAux.validityIntervalStart
      ? `${txAux.validityIntervalStart}`
      : null

    if (
      txAux.auxiliaryData?.type === 'CATALYST_VOTING' &&
      !isFeatureSupported(CryptoProviderFeature.VOTING)
    ) {
      throw new UnexpectedError(UnexpectedErrorReason.UnsupportedOperationError, {
        message: 'Catalyst registration not supported',
      })
    }

    const response = await withDevice(async (bitbox02: BitBox02API) => {
      return await bitbox02.cardanoSignTransaction({
        network: bb02Network,
        inputs,
        outputs,
        fee: txAux.fee.toString(),
        ttl: txAux.ttl.toString(),
        certificates,
        withdrawals,
        validityIntervalStart,
      })
    })

    const shelleyWitnesses = response.shelleyWitnesses.map(prepareShelleyWitness)
    const byronWitnesses = []
    const txWitnesses = cborizeTxWitnesses(byronWitnesses, shelleyWitnesses)
    const txAuxiliaryData = null
    const structuredTx = ShelleySignedTransactionStructured(txAux, txWitnesses, txAuxiliaryData)
    return {
      txHash: txAux.getId(),
      txBody: cbor.encode(structuredTx).toString('hex'),
    }
  }

  function witnessPoolRegTx(
    txAux: TxAux,
    addressToAbsPathMapper: AddressToPathMapper
  ): Promise<CborizedCliWitness> {
    throw new UnexpectedError(UnexpectedErrorReason.UnsupportedOperationError, {
      message: 'Operation not supported',
    })
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

export default ShelleyBitBox02CryptoProvider
