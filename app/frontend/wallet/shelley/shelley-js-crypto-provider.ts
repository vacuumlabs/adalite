/* eslint-disable no-use-before-define */
/* eslint-disable camelcase */
import {
  sign as signMsg,
  derivePrivate,
  xpubToHdPassphrase,
  base58,
  unpackBootstrapAddress,
} from 'cardano-crypto.js'
import {encode} from 'borc'

import HdNode from '../helpers/hd-node'
import {
  ShelleySignedTransactionStructured,
  ShelleyTxWitnessShelley,
  ShelleyTxWitnessByron,
} from './shelley-transaction'

// import {PROTOCOL_MAGIC_KEY} from '../constants'
import {isShelleyPath} from './helpers/addresses'
import CachedDeriveXpubFactory from '../helpers/CachedDeriveXpubFactory'

type HexString = string & {__typeHexString: any}

const ShelleyJsCryptoProvider = ({
  walletSecretDef: {rootSecret, derivationScheme},
  network,
  config,
}) => {
  const masterHdNode = HdNode(rootSecret)

  const isHwWallet = () => false

  const getWalletSecret = () => masterHdNode.toBuffer()

  const getDerivationScheme = () => derivationScheme

  const deriveXpub = CachedDeriveXpubFactory(
    derivationScheme,
    (derivationPath) => deriveHdNode(derivationPath).extendedPublicKey
  )

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
  async function signTx(txAux, inputsRaw, addressToAbsPathMapper) {
    const structured_tx = await signTxGetStructured(txAux, addressToAbsPathMapper)
    const tx = {
      txBody: encode(structured_tx).toString('hex'),
      txHash: structured_tx.getId().toString('hex'),
    }
    return tx
  }

  function getHdPassphrase() {
    return xpubToHdPassphrase(masterHdNode.extendedPublicKey)
  }

  const build_shelley_witness = async (tx_body_hash, path, sign) => {
    const signature = await sign(tx_body_hash, path)
    const xpub = await deriveXpub(path)
    return ShelleyTxWitnessShelley(xpub.slice(0, 32), signature)
  }

  const build_byron_witness = async (tx_body_hash, sign, path, address) => {
    const signature = await sign(tx_body_hash, path)
    const xpub = await deriveXpub(path)
    const hdPassphrase = await getHdPassphrase()
    const addressAttributes = unpackBootstrapAddress(address, hdPassphrase)
    return ShelleyTxWitnessByron(
      xpub.slice(0, 32),
      signature,
      xpub.slice(32, 64),
      encode(addressAttributes)
    )
  }

  const build_witnesses = async (inputs, tx_body_hash, sign, network, addressToAbsPathMapper) => {
    const _shelleyWitnesses = []
    const _byronWitnesses = []
    inputs.forEach((input) => {
      const inputPath = addressToAbsPathMapper(input.address)
      // console.log(inputPath)await getHdPassphrase()
      isShelleyPath(inputPath)
        ? _shelleyWitnesses.push(build_shelley_witness(tx_body_hash, inputPath, sign))
        : _byronWitnesses.push(build_byron_witness(tx_body_hash, sign, inputPath, input.address))
    })
    const shelleyWitnesses = await Promise.all(_shelleyWitnesses)
    const byronWitnesses = await Promise.all(_byronWitnesses) // TODO: move this below
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
      txAux.withdrawals
        ? [...txAux.inputs, ...txAux.certs, txAux.withdrawals]
        : [...txAux.inputs, ...txAux.certs], // TODO: a withdrawal!
      txHash,
      sign, // TODO: useless here
      network,
      addressToAbsPathMapper
    )
    const meta = null

    return ShelleySignedTransactionStructured(txAux, witnesses, meta)
  }

  function checkVersion() {
    return
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
    checkVersion,
  }
}

export default ShelleyJsCryptoProvider
