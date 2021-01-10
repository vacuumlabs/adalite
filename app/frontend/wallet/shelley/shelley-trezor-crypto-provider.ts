// eslint-disable-next-line import/no-unresolved
import CachedDeriveXpubFactory from '../helpers/CachedDeriveXpubFactory'
import {ADALITE_SUPPORT_EMAIL} from '../constants'
import derivationSchemes from '../helpers/derivation-schemes'
import NamedError from '../../helpers/NamedError'
import debugLog from '../../helpers/debugLog'
import {bech32} from 'cardano-crypto.js'

type BIP32Path = number[]

const CardanoTrezorCryptoProvider = ({network, config}) => {
  const derivationScheme = derivationSchemes.v2

  const TrezorConnect = require('trezor-connect').default

  TrezorConnect.manifest({
    email: ADALITE_SUPPORT_EMAIL,
    appUrl: config.ADALITE_SERVER_URL,
  })

  const isHwWallet = () => true
  const getWalletName = () => 'Trezor'

  const {deriveXpub, cleanXpubCache} = CachedDeriveXpubFactory(
    derivationScheme,
    config.shouldExportPubKeyBulk,
    async (absDerivationPaths: BIP32Path[]) => {
      const bundle = absDerivationPaths.map((path: BIP32Path) => ({path, showOnTrezor: false}))
      const response = await TrezorConnect.cardanoGetPublicKey({
        bundle,
      })
      throwIfNotSuccess(response)
      return response.payload.map(({publicKey}) => Buffer.from(publicKey, 'hex'))
    }
  )

  function deriveHdNode(childIndex) {
    throw NamedError('UnsupportedOperationError', {
      message: 'This operation is not supported on TrezorCryptoProvider!',
    })
  }

  function sign(message, absDerivationPath) {
    throw NamedError('UnsupportedOperationError', {message: 'Operation not supported'})
  }

  type CardanoAddressParameters = {
    addressType: number
    path: string | number[]
    stakingPath?: string | number[]
    stakingKeyHash?: string
    certificatePointer?: CardanoCertificatePointer
  }

  async function displayAddressForPath(absDerivationPath, stakingPath?) {
    const addressParameters: CardanoAddressParameters = {
      addressType: 0,
      path: absDerivationPath,
      stakingPath,
    }
    const response = await TrezorConnect.cardanoGetAddress({
      addressParameters,
      networkId: network.networkId,
      protocolMagic: network.protocolMagic,
      showOnTrezor: true,
    })

    throwIfNotSuccess(response)
  }
  type CardanoCertificatePointer = {
    blockIndex: number
    txIndex: number
    certificateIndex: number
  }

  type CardanoInput = {
    path?: string | number[]
    // eslint-disable-next-line camelcase
    prev_hash: string
    // eslint-disable-next-line camelcase
    prev_index: number
  }
  type CardanoOutput =
    | {
        addressParameters: CardanoAddressParameters
        amount: string
      }
    | {
        address: string
        amount: string
      }
  type CardanoCertificate = {
    type: number
    path?: string | number[]
    pool?: string
    poolParameters?: any
  }

  type CardanoWithdrawal = {
    path: string | number[]
    amount: string
  }

  function prepareInput(input, addressToAbsPathMapper): CardanoInput {
    const data = {
      ...(input.address && {path: addressToAbsPathMapper(input.address)}),
      prev_hash: input.txid,
      prev_index: input.outputNo,
    }

    return data
  }

  function prepareOutput(output, addressToAbsPathMapper): CardanoOutput {
    if (output.isChange) {
      return {
        amount: `${output.coins}`,
        addressParameters: {
          addressType: 0, // TODO: 0 for base address
          path: output.spendingPath,
          stakingPath: output.stakingPath,
        },
      }
    } else {
      return {
        address: output.address,
        amount: `${output.coins}`,
      }
    }
  }

  function poolCertToTrezorFormat(cert) {
    return {
      poolId: cert.poolKeyHashHex,
      vrfKeyHash: cert.vrfKeyHashHex,
      pledge: cert.pledgeStr,
      cost: cert.costStr,
      margin: {
        numerator: cert.margin.numeratorStr,
        denominator: cert.margin.denominatorStr,
      },
      rewardAccount: bech32.encode('stake', Buffer.from(cert.rewardAccountHex, 'hex')),
      owners: cert.poolOwners.map((owner) => ({
        ...(owner.stakingKeyHashHex && {
          stakingKeyHash: owner.stakingKeyHashHex,
        }),
        ...(owner.stakingPath && {
          stakingKeyPath: owner.stakingPath,
          stakingKeyHash: undefined,
        }),
      })),
      relays: cert.relays.map((relay) => ({
        type: relay.type,
        ...(relay.type === 0 && {
          ipv4Address: relay.params.ipv4,
          ipv6Address: relay.params.ipv6,
        }),
        ...(relay.type < 2 && {port: relay.params.portNumber}),
        ...(relay.type > 0 && {hostName: relay.params.dnsName}),
      })),
      metadata: cert.metadata
        ? {
          url: cert.metadata.metadataUrl,
          hash: cert.metadata.metadataHashHex,
        }
        : null,
    }
  }

  function prepareCertificate(cert, addressToAbsPathMapper): CardanoCertificate {
    return {
      type: cert.type,
      path: !cert.poolRegistrationParams ? addressToAbsPathMapper(cert.accountAddress) : undefined,
      pool: cert.poolHash ? cert.poolHash : undefined,
      poolParameters: cert.poolRegistrationParams
        ? poolCertToTrezorFormat(cert.poolRegistrationParams)
        : undefined,
    }
  }

  function prepareWithdrawal(withdrawal, addressToAbsPathMapper): CardanoWithdrawal {
    return {
      path: addressToAbsPathMapper(withdrawal.address),
      amount: `${withdrawal.rewards}`,
    }
  }

  async function signTx(unsignedTx, rawInputTxs, addressToAbsPathMapper) {
    const _inputs = []
    for (const input of unsignedTx.inputs) {
      const data = prepareInput(input, addressToAbsPathMapper)
      _inputs.push(data)
    }
    const inputs = await Promise.all(_inputs)

    const _outputs = []
    for (const output of unsignedTx.outputs) {
      const data = prepareOutput(output, addressToAbsPathMapper)
      _outputs.push(data)
    }
    const outputs = await Promise.all(_outputs)

    const certificates = []
    for (const cert of unsignedTx.certs) {
      const data = prepareCertificate(cert, addressToAbsPathMapper)
      certificates.push(data)
    }

    const fee = `${unsignedTx.fee.fee}`
    const ttl = `${unsignedTx.ttl.ttl}`
    const withdrawals = unsignedTx.withdrawals
      ? [prepareWithdrawal(unsignedTx.withdrawals, addressToAbsPathMapper)]
      : []

    const response = await TrezorConnect.cardanoSignTransaction({
      inputs,
      outputs,
      protocolMagic: network.protocolMagic,
      fee,
      ttl,
      networkId: network.networkId,
      certificates,
      withdrawals,
    })

    if (response.error || !response.success) {
      debugLog(response)
      throw NamedError('TrezorSignTxError', {message: response.payload.error})
    }

    return {
      txHash: response.payload.hash,
      txBody: response.payload.serializedTx,
    }
  }

  function getWalletSecret() {
    throw NamedError('UnsupportedOperationError', {message: 'Unsupported operation!'})
  }

  function getDerivationScheme() {
    return derivationScheme
  }

  function throwIfNotSuccess(response) {
    if (response.error || !response.success) {
      debugLog(response)
      throw NamedError('TrezorError', {
        message:
          'Trezor operation failed, please make sure ad blockers are switched off for this site and you are using the latest version of Trezor firmware',
      })
    }
  }

  function ensureFeatureIsSupported(featureName: string) {
    return
  }

  return {
    cleanXpubCache,
    getWalletSecret,
    getDerivationScheme,
    signTx,
    displayAddressForPath,
    deriveXpub,
    isHwWallet,
    getWalletName,
    _sign: sign,
    _deriveHdNode: deriveHdNode,
    network,
    ensureFeatureIsSupported,
  }
}

export default CardanoTrezorCryptoProvider
