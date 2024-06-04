import {
  InternalError,
  InternalErrorReason,
  UnexpectedError,
  UnexpectedErrorReason,
} from '../../errors'
import {
  CryptoProviderType,
  Network,
  TxCertificate,
  TxInput,
  TxOutput,
  TxShelleyWitness,
} from '../types'

import {
  CardanoAssetGroup,
  CardanoCertificate,
  CardanoInput,
  CardanoOutput,
  CardanoShelleyWitness,
  PairedBitBox,
} from 'bitbox-api'
import {
  AddressToPathMapper,
  BIP32Path,
  CertificateType,
  CryptoProviderFeature,
  TokenBundle,
} from '../../types'
import derivationSchemes from '../helpers/derivation-schemes'
import {CborizedCliWitness, TxAux, TxSigned} from './types'
import {hasRequiredVersion} from './helpers/version-check'
import {BITBOX02_ERRORS, BITBOX02_VERSIONS} from '../constants'
import {ShelleySignedTransactionStructured, cborizeTxWitnesses} from './shelley-transaction'
import {encodeCbor} from '../helpers/cbor'
import {orderTokenBundle} from '../helpers/tokenFormater'
import debugLog from '../../helpers/debugLog'
import CachedDeriveXpubFactory from '../helpers/CachedDeriveXpubFactory'

let activeBitBox02: PairedBitBox | null = null

type CryptoProviderParams = {
  network: Network
  config: any
}

const ShelleyBitBox02CryptoProvider = async ({
  network,
  config,
}: CryptoProviderParams): Promise<any> => {
  const bitbox = await import('bitbox-api')

  if (activeBitBox02 !== null) {
    try {
      activeBitBox02.close()
    } finally {
      activeBitBox02 = null
    }
  }

  const derivationScheme = derivationSchemes.v2
  const selectedNetwork = network.networkId === 1 ? 'mainnet' : 'testnet'

  const withDevice = async <T>(f: (device: PairedBitBox) => Promise<T>): Promise<T> => {
    if (activeBitBox02 !== null) {
      return await f(activeBitBox02)
    }

    try {
      const unpaired = await bitbox.bitbox02ConnectAuto(() => {
        activeBitBox02 = null
      })
      const pairing = await unpaired.unlockAndPair()
      const pairingCode = pairing.getPairingCode()
      if (pairingCode) {
        config.bitbox02OnPairingCode(pairingCode)
      }
      const pairedBitBox = await pairing.waitConfirm()
      if (pairedBitBox.product() !== 'bitbox02-multi') {
        throw new Error('Error: unsupported device.')
      }
      activeBitBox02 = pairedBitBox
      return await f(pairedBitBox)
    } catch (err) {
      const typedErr = bitbox.ensureError(err)
      debugLog(typedErr)
      if (activeBitBox02 !== null) {
        try {
          activeBitBox02.close()
        } finally {
          activeBitBox02 = null
        }
      }
      throw new InternalError(InternalErrorReason.BitBox02Error, {
        message: `Error: ${typedErr.message}.`,
      })
    } finally {
      config.bitbox02OnPairingCode(null)
    }
  }

  const ensureFeatureIsSupported = (feature: CryptoProviderFeature) => {
    if (!isFeatureSupported(feature)) {
      throw new InternalError(
        BITBOX02_ERRORS[feature] ?? BITBOX02_ERRORS[CryptoProviderFeature.MINIMAL],
        {message: `${version.major}.${version.minor}.${version.patch}`}
      )
    }
  }

  const prepareShelleyWitness = (witness: CardanoShelleyWitness): TxShelleyWitness => {
    return {
      publicKey: Buffer.from(witness.publicKey),
      signature: Buffer.from(witness.signature),
    }
  }

  const version = await withDevice(async (pairedBitbox) => {
    const deviceInfo = await pairedBitbox.deviceInfo()
    const version = deviceInfo.version.split('.')
    return {
      major: version[0],
      minor: version[1],
      patch: version[2],
    }
  })

  const prepareTokenBundle = (tokenBundle: TokenBundle): CardanoAssetGroup[] => {
    if (tokenBundle.length > 0 && !isFeatureSupported(CryptoProviderFeature.MULTI_ASSET)) {
      throw new InternalError(InternalErrorReason.BitBox02MultiAssetNotSupported, {
        message: 'Please update your BitBox02 firmware for token support.',
      })
    }
    const orderedTokenBundle = orderTokenBundle(tokenBundle)
    return orderedTokenBundle.map(({policyId, assets}) => {
      const tokens = assets.map(({assetName, quantity}) => ({
        assetName: Buffer.from(assetName, 'hex'),
        value: quantity as unknown as bigint,
      }))
      return {
        policyId: Buffer.from(policyId, 'hex'),
        tokens,
      }
    })
  }

  const prepareInput = (
    input: TxInput,
    addressToAbsPathMapper: AddressToPathMapper
  ): CardanoInput => {
    const bip32Path = addressToAbsPathMapper(input.address)
    const keypathString = `m/${bip32Path.join("'/")}'` // use this as the keypath input
    return {
      keypath: keypathString,
      prevOutHash: Buffer.from(input.txHash, 'hex'),
      prevOutIndex: input.outputIndex,
    }
  }

  const prepareOutput = (output: TxOutput): CardanoOutput => {
    const assetGroups = prepareTokenBundle(output.tokenBundle)
    return {
      encodedAddress: output.address,
      value: output.coins as unknown as bigint,
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

  const prepareCertificate = (
    certificate: TxCertificate,
    addressToAbsPathMapper: AddressToPathMapper
  ): CardanoCertificate => {
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

  const isFeatureSupported = (feature: CryptoProviderFeature) => {
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

  const signTx = async (
    txAux: TxAux,
    addressToAbsPathMapper: AddressToPathMapper
  ): Promise<TxSigned> => {
    const inputs = txAux.inputs.map((input) => prepareInput(input, addressToAbsPathMapper))
    const outputs = txAux.outputs.map(prepareOutput)
    const withdrawals = txAux.withdrawals.map((withdrawal) => ({
      keypath: addressToAbsPathMapper(withdrawal.stakingAddress),
      value: withdrawal.rewards as unknown as bigint,
    }))
    const certificates = txAux.certificates.map((certificate) =>
      prepareCertificate(certificate, addressToAbsPathMapper)
    )

    if (
      txAux.auxiliaryData?.type === 'CATALYST_VOTING' &&
      !isFeatureSupported(CryptoProviderFeature.VOTING)
    ) {
      throw new UnexpectedError(UnexpectedErrorReason.UnsupportedOperationError, {
        message: 'Catalyst registration not supported',
      })
    }

    const response = await withDevice(async (pairedBitbox) => {
      return await pairedBitbox.cardanoSignTransaction({
        network: selectedNetwork,
        inputs,
        outputs,
        fee: txAux.fee as unknown as bigint,
        ttl: (txAux.ttl as unknown as bigint) ?? null,
        certificates,
        withdrawals,
        validityIntervalStart: (txAux.validityIntervalStart as unknown as bigint) ?? null,
        allowZeroTTL: false,
      })
    })

    const shelleyWitnesses = response.shelleyWitnesses.map(prepareShelleyWitness)
    const byronWitnesses = []
    const txWitnesses = cborizeTxWitnesses(byronWitnesses, shelleyWitnesses)
    const txAuxiliaryData = null
    const structuredTx = ShelleySignedTransactionStructured(txAux, txWitnesses, txAuxiliaryData)
    return {
      txHash: txAux.getId(),
      txBody: encodeCbor(structuredTx).toString('hex'),
    }
  }

  const getType = () => CryptoProviderType.BITBOX02

  const deriveXpub = CachedDeriveXpubFactory(
    derivationScheme,
    config.shouldExportPubKeyBulk && isFeatureSupported(CryptoProviderFeature.BULK_EXPORT),
    async (derivationPaths: BIP32Path[]) => {
      return await withDevice(async (pairedBitBox) => {
        const xpubs: Uint8Array[] = await pairedBitBox.cardanoXpubs(derivationPaths)
        return xpubs.map(Buffer.from)
      })
    },
    isFeatureSupported(CryptoProviderFeature.BYRON)
  )

  const displayAddressForPath = async (
    absDerivationPath: BIP32Path,
    stakingPath: BIP32Path
  ): Promise<void> => {
    await withDevice(async (pairedBitBox) => {
      await pairedBitBox.cardanoAddress(
        selectedNetwork,
        {
          pkhSkh: {
            keypathPayment: absDerivationPath,
            keypathStake: stakingPath,
          },
        },
        false
      )
    })
  }

  const getHdPassphrase = () => {
    throw new UnexpectedError(UnexpectedErrorReason.UnsupportedOperationError, {
      message: 'Operation not supported',
    })
  }

  const witnessPoolRegTx = (): Promise<CborizedCliWitness> => {
    throw new UnexpectedError(UnexpectedErrorReason.UnsupportedOperationError, {
      message: 'Operation not supported',
    })
  }

  const getWalletSecret = () => {
    throw new UnexpectedError(UnexpectedErrorReason.UnsupportedOperationError, {
      message: 'Operation not supported',
    })
  }

  const sign = () => {
    throw new UnexpectedError(UnexpectedErrorReason.UnsupportedOperationError, {
      message: 'Operation not supported',
    })
  }

  const getDerivationScheme = () => derivationScheme
  const getVersion = (): string => `${version.major}.${version.minor}.${version.patch}`

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
