/* eslint-disable no-use-before-define */
/* eslint-disable camelcase */
import {
  sign as signMsg,
  derivePrivate,
  xpubToHdPassphrase,
  getBootstrapAddressAttributes,
  base58,
} from 'cardano-crypto.js'
import {encode} from 'borc'

import HdNode, {_HdNode} from '../helpers/hd-node'
import {ShelleySignedTransactionStructured, ShelleyTxWitnesses} from './shelley-transaction'

import {isShelleyPath, xpub2ChainCode, xpub2pub} from './helpers/addresses'
import CachedDeriveXpubFactory from '../helpers/CachedDeriveXpubFactory'
import {
  AddressToPathMapper,
  BIP32Path,
  CryptoProvider,
  CryptoProviderFeature,
  HexString,
  _Address,
} from '../../types'
import NamedError from '../../helpers/NamedError'
import {Network, _ByronWitness, _ShelleyWitness} from '../types'
import {_SignedTx, _TxAux, _TxSigned} from './types'

type CryptoProviderParams = {
  walletSecretDef: any
  network: Network
  config: any
}

const ShelleyJsCryptoProvider = async ({
  walletSecretDef: {rootSecret, derivationScheme},
  network,
  config,
}: // eslint-disable-next-line require-await
CryptoProviderParams): Promise<CryptoProvider> => {
  const masterHdNode = HdNode(rootSecret)

  const isHwWallet = () => false

  const getWalletName = () => 'Mnemonic'

  const getWalletSecret = () => masterHdNode.toBuffer()

  const getDerivationScheme = () => derivationScheme

  const deriveXpub = CachedDeriveXpubFactory(
    derivationScheme,
    config.shouldExportPubKeyBulk,
    (derivationPaths: BIP32Path[]) => {
      return derivationPaths.map((path) => deriveHdNode(path).extendedPublicKey)
    }
  )

  function deriveHdNode(derivationPath: BIP32Path): _HdNode {
    return derivationPath.reduce(deriveChildHdNode, masterHdNode)
  }

  function deriveChildHdNode(hdNode: _HdNode, childIndex: number): _HdNode {
    const result = derivePrivate(hdNode.toBuffer(), childIndex, derivationScheme.ed25519Mode)

    return HdNode(result)
  }

  async function sign(message: HexString, keyDerivationPath: BIP32Path): Promise<Buffer> {
    const hdNode = await deriveHdNode(keyDerivationPath)
    const messageToSign = Buffer.from(message, 'hex')
    return signMsg(messageToSign, hdNode.toBuffer())
  }

  // eslint-disable-next-line require-await
  async function signTx(
    txAux: _TxAux,
    addressToPathMapper: AddressToPathMapper
  ): Promise<_SignedTx> {
    const structuredTx = await signTxGetStructured(txAux, addressToPathMapper)
    const tx = {
      txBody: encode(structuredTx).toString('hex'),
      txHash: structuredTx.getId(),
    }
    return tx
  }

  function getHdPassphrase(): Buffer {
    return xpubToHdPassphrase(masterHdNode.extendedPublicKey)
  }

  const prepareShelleyWitness = async (
    txHash: HexString,
    path: BIP32Path
  ): Promise<_ShelleyWitness> => {
    const signature = await sign(txHash, path)
    const xpub = await deriveXpub(path)
    const publicKey = xpub2pub(xpub)
    return {publicKey, signature}
  }

  const prepareByronWitness = async (
    txHash: HexString,
    path: BIP32Path,
    address: _Address
  ): Promise<_ByronWitness> => {
    const signature = await sign(txHash, path)
    const xpub = await deriveXpub(path)
    const publicKey = xpub2pub(xpub)
    const chainCode = xpub2ChainCode(xpub)
    // TODO: we should get address addresses from cardano-crypto
    // but for some reason it returns something invalid for testnet
    const addressAttributes = encode({})
    return {publicKey, signature, chainCode, addressAttributes}
  }

  const prepareWitnesses = async (txAux: _TxAux, addressToAbsPathMapper: AddressToPathMapper) => {
    const {inputs, certificates, withdrawals, getId} = txAux
    const txHash = getId()
    const _shelleyWitnesses = []
    const _byronWitnesses = []

    // TODO: we should create witnesses only with unique addresses

    inputs.forEach(({address}) => {
      const spendingPath = addressToAbsPathMapper(address)
      isShelleyPath(spendingPath)
        ? _shelleyWitnesses.push(prepareShelleyWitness(txHash, spendingPath))
        : _byronWitnesses.push(prepareByronWitness(txHash, spendingPath, address))
    })
    ;[...certificates, ...withdrawals].forEach(({stakingAddress}) => {
      const stakingPath = addressToAbsPathMapper(stakingAddress)
      _shelleyWitnesses.push(prepareShelleyWitness(txHash, stakingPath))
    })

    const shelleyWitnesses: _ShelleyWitness[] = await Promise.all(_shelleyWitnesses)
    const byronWitnesses: _ByronWitness[] = await Promise.all(_byronWitnesses)
    return {shelleyWitnesses, byronWitnesses}
  }

  async function signTxGetStructured(
    txAux: _TxAux,
    addressToPathMapper: AddressToPathMapper
  ): Promise<_TxSigned> {
    const {shelleyWitnesses, byronWitnesses} = await prepareWitnesses(txAux, addressToPathMapper)
    const txWitnesses = ShelleyTxWitnesses(byronWitnesses, shelleyWitnesses)
    const txMeta = null

    return ShelleySignedTransactionStructured(txAux, txWitnesses, txMeta)
  }

  function isFeatureSupported(feature: CryptoProviderFeature) {
    return true
  }

  function ensureFeatureIsSupported(feature: CryptoProviderFeature) {
    return true
  }

  function displayAddressForPath(absDerivationPath: BIP32Path, stakingPath: BIP32Path) {
    throw NamedError('UnsupportedOperationError', {message: 'Operation not supported'})
  }

  return {
    network,
    signTx,
    getWalletSecret,
    getWalletName,
    getDerivationScheme,
    deriveXpub,
    isHwWallet,
    getHdPassphrase,
    _sign: sign,
    ensureFeatureIsSupported,
    isFeatureSupported,
    displayAddressForPath,
  }
}

export default ShelleyJsCryptoProvider
