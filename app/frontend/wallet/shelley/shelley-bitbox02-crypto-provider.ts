import {
  CardanoInput,
  CardanoOutput,
  CardanoCertificate,
  CardanoShelleyWitness,
  BitBox02API,
  getDevicePath,
  constants as bitbox02Constants,
} from 'bitbox02-api'
import * as cbor from 'borc'
import CachedDeriveXpubFactory from '../helpers/CachedDeriveXpubFactory'
import {ShelleySignedTransactionStructured, cborizeTxWitnesses} from './shelley-transaction'
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
} from '../../types'
import {
  Network,
  NetworkId,
  TxCertificate,
  TxInput,
  TxOutput,
  TxShelleyWitness,
  WalletName,
} from '../types'
import {TxSigned, TxAux, CborizedCliWitness} from './types'
import {
  InternalError,
  InternalErrorReason,
  UnexpectedError,
  UnexpectedErrorReason,
} from '../../errors'

type CryptoProviderParams = {
  network: Network
  config: any
}

const ShelleyBitBox02CryptoProvider = async ({
  network,
  config,
}: CryptoProviderParams): Promise<CryptoProvider> => {
  let bitbox02: BitBox02API | undefined
  async function withDevice<T>(f: (BitBox02API) => Promise<T>): Promise<T> {
    if (bitbox02 !== undefined) {
      return await f(bitbox02)
    }
    try {
      const devicePath = await getDevicePath()
      bitbox02 = new BitBox02API(devicePath)
      await bitbox02.connect(
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
          bitbox02 = undefined
        },
        (status) => {
          if (status === bitbox02Constants.Status.PairingFailed) {
            config.bitbox02OnPairingCode(null)
          }
        }
      )

      if (bitbox02.firmware().Product() !== bitbox02Constants.Product.BitBox02Multi) {
        throw new Error('Unsupported device')
      }

      return await f(bitbox02)
    } catch (err) {
      debugLog(err)
      if (bitbox02 !== undefined) {
        bitbox02.close()
        bitbox02 = undefined
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

  const isHwWallet = () => true
  const getWalletName = (): WalletName.BITBOX02 => WalletName.BITBOX02

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
      case CryptoProviderFeature.MULTI_ASSET:
      case CryptoProviderFeature.VOTING:
        return false
      default:
        return BITBOX02_VERSIONS[feature]
          ? hasRequiredVersion(version, BITBOX02_VERSIONS[feature])
          : true
    }
  }

  function ensureFeatureIsSupported(feature: CryptoProviderFeature): void {
    if (!isFeatureSupported(feature)) {
      throw new InternalError(BITBOX02_ERRORS[feature], {
        message: `${version.major}.${version.minor}.${version.patch}`,
      })
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
      message: 'Unsupported operation!',
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

  function prepareOutput(output: TxOutput): CardanoOutput {
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
    isHwWallet,
    getWalletName,
    _sign: sign,
    isFeatureSupported,
    ensureFeatureIsSupported,
    getVersion,
  }
}

export default ShelleyBitBox02CryptoProvider
