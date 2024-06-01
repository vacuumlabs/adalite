
import {
  InternalError,
  InternalErrorReason,
  UnexpectedError,
  UnexpectedErrorReason,
} from '../../errors'
import {CryptoProviderType, Network, TxCertificate, TxInput, TxOutput, TxShelleyWitness} from '../types'

import * as bitbox from 'bitbox-api'
import {
  AddressToPathMapper,
  BIP32Path,
  CertificateType,
  CryptoProviderFeature,
  DerivationScheme,
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


let NEWactiveBitBox02: bitbox.PairedBitBox | null = null

type CryptoProviderParams = {
  network: Network
  config: any
}


const XShelleyBitBox02CryptoProvider = async ({
  network,
  config,
}: CryptoProviderParams): Promise<any> => {

  if (NEWactiveBitBox02 !== null) {
    try {
      NEWactiveBitBox02.close()
    } finally {
      NEWactiveBitBox02 = null
    }
  }

  const derivationScheme = derivationSchemes.v2
  const selectedNetwork = network.networkId === 1 ? 'mainnet' : 'testnet'

  function ensureFeatureIsSupported(feature: CryptoProviderFeature): void {
    if (!isFeatureSupported(feature)) {
      throw new InternalError(
        BITBOX02_ERRORS[feature] ?? BITBOX02_ERRORS[CryptoProviderFeature.MINIMAL],
        {message: `${version.major}.${version.minor}.${version.patch}`}
      )
    }
  }

  function prepareShelleyWitness(witness: bitbox.CardanoShelleyWitness): TxShelleyWitness {
    return {
      publicKey: Buffer.from(witness.publicKey),
      signature: Buffer.from(witness.signature),
    }
  }

  async function withDevice<T>(f: (BitBox02API) => Promise<T>): Promise<T> {
    if (NEWactiveBitBox02 !== null) {
      return await f(NEWactiveBitBox02)
    }

    try {
      const bbx = await import('bitbox-api')
      const debugConnect = await bbx.bitbox02ConnectAuto(() => {
        NEWactiveBitBox02 = null
      })
      const pairing = await debugConnect.unlockAndPair()
      const pairingCode = pairing.getPairingCode()
      if (!pairing) {
        //todo
      }
      config.bitbox02OnPairingCode(pairingCode!)
      const bb02 = await pairing.waitConfirm()
      NEWactiveBitBox02 = bb02
      console.log('Product', bb02.product())
      console.log('Supports Ethereum functionality (Multi edition)?', bb02.ethSupported())
      const deviceInfos = await bb02.deviceInfo()
      console.log('Device infos:', deviceInfos)
      return await f(NEWactiveBitBox02)
    } catch (err) {

      debugLog(err)
      if (NEWactiveBitBox02 !== null) {
        try {
          NEWactiveBitBox02.close()
        } finally {
          NEWactiveBitBox02 = null
        }
      }
      throw new InternalError(InternalErrorReason.BitBox02Error, {
        message: err,
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

  const version = await withDevice(async (pairedBitbox: bitbox.PairedBitBox) => {
    const deviceInfo = await pairedBitbox.deviceInfo()
    const version = deviceInfo.version.split('.')
    return {
      major: version[0],
      minor: version[1],
      patch: version[2],
    }
  })
  const getVersion = (): string => `${version.major}.${version.minor}.${version.patch}`

  function prepareTokenBundle(tokenBundle: TokenBundle): bitbox.CardanoAssetGroup[] {
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

  function prepareInput(
    input: TxInput,
    addressToAbsPathMapper: AddressToPathMapper):
    bitbox.CardanoInput {
    const bip32Path = addressToAbsPathMapper(input.address)
    const keypathString = `m/${bip32Path.join("'/")}'` // use this as the keypath input
    return {
      keypath: keypathString,
      prevOutHash: Buffer.from(input.txHash, 'hex'),
      prevOutIndex: input.outputIndex,
    }
  }

  function formatBIP32Path(bip32Path: BIP32Path): string {
    const pathString = bip32Path.map((index, i) => (i < 3 ? `${index}'` : index)).join('/')
    return `m/${pathString}`
  }

  function prepareOutput(output: TxOutput): bitbox.CardanoOutput {
    const assetGroups = prepareTokenBundle(output.tokenBundle)
    return {
      encodedAddress: output.address,
      value: output.coins as unknown as bigint,
      scriptConfig: output.isChange
        ? {
          pkhSkh: {
            keypathPayment: formatBIP32Path(output.spendingPath),
            keypathStake: formatBIP32Path(output.stakingPath),
          },
        }
        : undefined,
      assetGroups,
    }
  }


  function prepareCertificate(
    certificate: TxCertificate,
    addressToAbsPathMapper: AddressToPathMapper
  ): bitbox.CardanoCertificate {
    switch (certificate.type) {
      case CertificateType.STAKING_KEY_REGISTRATION:
        return {
          stakeRegistration: {
            keypath: formatBIP32Path(addressToAbsPathMapper(certificate.stakingAddress)),
          },
        }
      case CertificateType.STAKING_KEY_DEREGISTRATION:
        return {
          stakeDeregistration: {
            keypath: formatBIP32Path(addressToAbsPathMapper(certificate.stakingAddress)),
          },
        }
      case CertificateType.DELEGATION:
        return {
          stakeDelegation: {
            keypath: formatBIP32Path(addressToAbsPathMapper(certificate.stakingAddress)),
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

  async function signTx(
    txAux: TxAux,
    addressToAbsPathMapper: AddressToPathMapper
  ): Promise<TxSigned> {
    const inputs = txAux.inputs.map((input) => prepareInput(input, addressToAbsPathMapper))
    const outputs = txAux.outputs.map(prepareOutput)
    const withdrawals = txAux.withdrawals.map((withdrawal) => ({
      keypath: formatBIP32Path(addressToAbsPathMapper(withdrawal.stakingAddress)),
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

    const response = await withDevice(async (pairedBitbox: bitbox.PairedBitBox) => {
      return await pairedBitbox.cardanoSignTransaction({
        network: selectedNetwork,
        inputs,
        outputs,
        fee: txAux.fee as unknown as bigint,
        ttl: (txAux.ttl) as unknown as bigint ?? null,
        certificates,
        withdrawals,
        validityIntervalStart: (txAux.validityIntervalStart) as unknown as bigint ?? null,
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

  function sign(): void {
    throw new UnexpectedError(UnexpectedErrorReason.UnsupportedOperationError, {
      message: 'Operation not supported',
    })
  }

  const getType = () => CryptoProviderType.BITBOX02_NEW

  const deriveXpub = CachedDeriveXpubFactory(
    derivationScheme,
    config.shouldExportPubKeyBulk && isFeatureSupported(CryptoProviderFeature.BULK_EXPORT),
    async (derivationPaths: BIP32Path[]) => {
      return await withDevice(async (pairedBitBox: bitbox.PairedBitBox) => {
        const stringifiedDerivationPaths = derivationPaths.map((d) => formatBIP32Path(d))
        const xpubs: Uint8Array[] = await pairedBitBox.cardanoXpubs(stringifiedDerivationPaths)
        return xpubs.map(Buffer.from)
      })
    },
    isFeatureSupported(CryptoProviderFeature.BYRON)
  )

  async function displayAddressForPath(
    absDerivationPath: BIP32Path,
    stakingPath: BIP32Path
  ): Promise<void> {
    await withDevice(async (pairedBitBox: bitbox.PairedBitBox) => {
      await pairedBitBox.cardanoAddress(selectedNetwork, {
        pkhSkh: {
          keypathPayment: formatBIP32Path(absDerivationPath),
          keypathStake: formatBIP32Path(stakingPath),
        },
      },
      false)
    })
  }

  function getHdPassphrase(): void {
    throw new UnexpectedError(UnexpectedErrorReason.UnsupportedOperationError, {
      message: 'Operation not supported',
    })
  }


  function witnessPoolRegTx(
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

export default XShelleyBitBox02CryptoProvider

