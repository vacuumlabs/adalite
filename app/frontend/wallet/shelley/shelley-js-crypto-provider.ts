/* eslint-disable no-use-before-define */
/* eslint-disable camelcase */
import {sign as signMsg, derivePrivate, xpubToHdPassphrase} from 'cardano-crypto.js'
import {encode, decode} from 'borc'

import HdNode from '../helpers/hd-node'
import {
  ShelleySignedTransactionStructured,
  ShelleyTxWitnessShelley,
  ShelleyTxWitnessByron,
} from './shelley-transaction'

import {HARDENED_THRESHOLD, PROTOCOL_MAGIC_KEY} from '../constants'

type HexString = string & {__typeHexString: any}

const ShelleyJsCryptoProvider = ({walletSecretDef: {rootSecret, derivationScheme}, network}) => {
  const masterHdNode = HdNode(rootSecret)

  const isHwWallet = () => false

  const getWalletSecret = () => masterHdNode.toBuffer()

  const getDerivationScheme = () => derivationScheme

  const deriveXpub = (derivationPath) => deriveHdNode(derivationPath).extendedPublicKey

  const derivePub = (derivationPath) => deriveHdNode(derivationPath).publicKey

  const getChainCode = () => derivationScheme.ed25519Mode

  const deriveXpriv = (derivationPath) => deriveHdNode(derivationPath).secretKey

  function deriveHdNode(derivationPath) {
    return derivationPath.reduce(deriveChildHdNode, masterHdNode)
  }

  function deriveChildHdNode(hdNode, childIndex) {
    const result = derivePrivate(hdNode.toBuffer(), childIndex, derivationScheme.ed25519Mode)

    return HdNode(result)
  }

  async function sign(message, keyDerivationPath) {
    const hdNode = await deriveHdNode(keyDerivationPath)
    const messageToSign = Buffer.from(message, 'hex')

    return signMsg(messageToSign, hdNode.toBuffer())
  }

  // eslint-disable-next-line require-await
  async function signTx(txAux, addressToAbsPathMapper) {
    const structured_tx = await signTxGetStructured(txAux, addressToAbsPathMapper)
    const tx = {
      txBody: encode(structured_tx).toString('hex'),
      txHash: structured_tx.getId().toString('hex'),
    }
    console.log(structured_tx)
    return tx
  }

  function getHdPassphrase() {
    return xpubToHdPassphrase(masterHdNode.extendedPublicKey)
  }

  const build_shelley_witness = async (tx_body_hash, path, sign) => {
    const signature = await sign(tx_body_hash, path)
    return ShelleyTxWitnessShelley(derivePub(path), signature)
  }

  const build_byron_witness = async (tx_body_hash, sign, path, network) => {
    const signature = await sign(tx_body_hash, path)
    const address_attributes = encode(
      network.name === 'mainnet'
        ? {}
        : new Map().set([PROTOCOL_MAGIC_KEY], encode(network.protocolMagic))
    )
    return ShelleyTxWitnessByron(derivePub(path), signature, getChainCode(), address_attributes)
  }

  const build_witnesses = async (inputs, tx_body_hash, sign, network, addressToAbsPathMapper) => {
    const isShelleyPath = (path) => path[0] - HARDENED_THRESHOLD === 1852 // TODO: move this somewhere
    const _shelleyWitnesses = []
    const _byronWitnesses = []
    inputs.forEach((input) => {
      const inputPath = addressToAbsPathMapper(input.address)
      isShelleyPath(inputPath)
        ? _shelleyWitnesses.push(build_shelley_witness(tx_body_hash, inputPath, sign))
        : _byronWitnesses.push(build_byron_witness(tx_body_hash, inputPath, sign, network))
    })
    const shelleyWitnesses = await Promise.all(_shelleyWitnesses)
    const byronWitnesses = await Promise.all(_byronWitnesses)
    const witnesses = new Map()
    if (shelleyWitnesses.length > 0) {
      witnesses.set(0, shelleyWitnesses)
    }
    if (byronWitnesses.length > 0) {
      witnesses.set(2, byronWitnesses)
    }
    return witnesses
  }

  async function signTxGetStructured(txAux, addressToAbsPathMapper) {
    const txHash = txAux.getId()
    const witnesses = await build_witnesses(
      txAux.inputs,
      txHash,
      sign,
      network,
      addressToAbsPathMapper
    )
    const meta = null

    return ShelleySignedTransactionStructured(txAux, witnesses, meta)
  }

  return {
    network,
    signTx,
    getWalletSecret,
    getDerivationScheme,
    deriveXpub,
    isHwWallet,
    getHdPassphrase,
    _sign: sign,
    _deriveHdNodeFromRoot: deriveHdNode,
    _deriveChildHdNode: deriveChildHdNode,
    deriveXpriv,
  }
}

export default ShelleyJsCryptoProvider
