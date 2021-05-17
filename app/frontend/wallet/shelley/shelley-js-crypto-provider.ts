/* eslint-disable no-use-before-define */
/* eslint-disable camelcase */
import {
  sign as signMsg,
  derivePrivate,
  xpubToHdPassphrase,
  base58,
  getBootstrapAddressAttributes,
  blake2b,
} from 'cardano-crypto.js'
import {encode} from 'borc'

import HdNode, {_HdNode} from '../helpers/hd-node'
import {
  ShelleySignedTransactionStructured,
  cborizeTxWitnesses,
  cborizeTxAuxiliaryVotingData,
  cborizeTxVotingRegistration,
  ShelleyTxAux,
} from './shelley-transaction'

import {isShelleyPath, xpub2ChainCode, xpub2pub} from './helpers/addresses'
import CachedDeriveXpubFactory from '../helpers/CachedDeriveXpubFactory'
import {
  AddressToPathMapper,
  BIP32Path,
  CryptoProvider,
  CryptoProviderFeature,
  HexString,
  Address,
} from '../../types'
import {Network, TxAuxiliaryData, TxByronWitness, TxShelleyWitness, WalletName} from '../types'
import {
  TxSigned,
  TxAux,
  CborizedTxSignedStructured,
  CborizedVotingRegistrationMetadata,
  FinalizedAuxiliaryDataTx,
} from './types'
import {UnexpectedError, UnexpectedErrorReason} from '../../errors'
import assertUnreachable from '../../helpers/assertUnreachable'

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

  const getWalletName = (): WalletName.MNEMONIC => WalletName.MNEMONIC

  const getWalletSecret = () => masterHdNode.toBuffer()

  const getDerivationScheme = () => derivationScheme

  const getVersion = () => null

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
  async function signTx(txAux: TxAux, addressToPathMapper: AddressToPathMapper): Promise<TxSigned> {
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
  ): Promise<TxShelleyWitness> => {
    const signature = await sign(txHash, path)
    const xpub = await deriveXpub(path)
    const publicKey = xpub2pub(xpub)
    return {publicKey, signature}
  }

  const prepareByronWitness = async (
    txHash: HexString,
    path: BIP32Path,
    address: Address
  ): Promise<TxByronWitness> => {
    const signature = await sign(txHash, path)
    const xpub = await deriveXpub(path)
    const publicKey = xpub2pub(xpub)
    const chainCode = xpub2ChainCode(xpub)
    // TODO: check if this works for testnet, apparently it doesnt
    const addressAttributes = encode(getBootstrapAddressAttributes(base58.decode(address)))
    return {publicKey, signature, chainCode, addressAttributes}
  }

  const prepareWitnesses = async (txAux: TxAux, addressToAbsPathMapper: AddressToPathMapper) => {
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

    const shelleyWitnesses: TxShelleyWitness[] = await Promise.all(_shelleyWitnesses)
    const byronWitnesses: TxByronWitness[] = await Promise.all(_byronWitnesses)
    return {shelleyWitnesses, byronWitnesses}
  }

  async function prepareVotingAuxiliaryData(
    auxiliaryData: TxAuxiliaryData
  ): Promise<CborizedVotingRegistrationMetadata> {
    const cborizedRegistrationData = new Map([cborizeTxVotingRegistration(auxiliaryData)])
    const registrationDataHash = blake2b(encode(cborizedRegistrationData), 32).toString('hex')
    const stakingPath = auxiliaryData.rewardDestinationAddress.stakingPath
    const registrationDataWitness = await prepareShelleyWitness(registrationDataHash, stakingPath)
    const registrationDataSignature = registrationDataWitness.signature.toString('hex')
    const txAuxiliaryData = cborizeTxAuxiliaryVotingData(auxiliaryData, registrationDataSignature)
    return txAuxiliaryData
  }

  async function finalizeTxAuxWithMetadata(txAux: TxAux): Promise<FinalizedAuxiliaryDataTx> {
    if (!txAux.auxiliaryData) {
      return {
        finalizedTxAux: txAux,
        txAuxiliaryData: null,
      }
    }
    switch (txAux.auxiliaryData.type) {
      case 'CATALYST_VOTING': {
        const txAuxiliaryData = await prepareVotingAuxiliaryData(txAux.auxiliaryData)
        return {
          finalizedTxAux: ShelleyTxAux({
            ...txAux,
            auxiliaryDataHash: blake2b(encode(txAuxiliaryData), 32).toString('hex'),
          }),
          txAuxiliaryData,
        }
      }
      default:
        return assertUnreachable(txAux.auxiliaryData.type)
    }
  }

  async function signTxGetStructured(
    txAux: TxAux,
    addressToPathMapper: AddressToPathMapper
  ): Promise<CborizedTxSignedStructured> {
    const {finalizedTxAux, txAuxiliaryData} = await finalizeTxAuxWithMetadata(txAux)

    const {shelleyWitnesses, byronWitnesses} = await prepareWitnesses(
      finalizedTxAux,
      addressToPathMapper
    )
    const txWitnesses = cborizeTxWitnesses(byronWitnesses, shelleyWitnesses)

    return ShelleySignedTransactionStructured(finalizedTxAux, txWitnesses, txAuxiliaryData)
  }

  function isFeatureSupported(feature: CryptoProviderFeature) {
    return true
  }

  function ensureFeatureIsSupported(feature: CryptoProviderFeature) {
    return true
  }

  function displayAddressForPath(absDerivationPath: BIP32Path, stakingPath: BIP32Path) {
    throw new UnexpectedError(UnexpectedErrorReason.UnsupportedOperationError, {
      message: 'Operation not supported',
    })
  }

  // eslint-disable-next-line require-await
  async function witnessPoolRegTx(
    txAux: TxAux,
    addressToAbsPathMapper: AddressToPathMapper
  ): Promise<any> {
    throw new UnexpectedError(UnexpectedErrorReason.UnsupportedOperationError)
  }

  return {
    network,
    signTx,
    witnessPoolRegTx,
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
    getVersion,
  }
}

export default ShelleyJsCryptoProvider
