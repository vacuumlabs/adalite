/* eslint-disable no-use-before-define */
/* eslint-disable camelcase */
import {sign as signMsg, derivePrivate, xpubToHdPassphrase} from 'cardano-crypto.js'
import {encode} from 'borc'

import HdNode from '../helpers/hd-node'
import {
  ShelleySignedTransactionStructured,
  ShelleyTxWitnessShelley,
  ShelleyTxWitnessByron,
} from './shelley-transaction'

// import {PROTOCOL_MAGIC_KEY} from '../constants'
import {isShelleyPath} from './helpers/addresses'

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

  const deriveXpub = (derivationPath) => deriveHdNode(derivationPath).extendedPublicKey

  const derivePub = (derivationPath) => deriveHdNode(derivationPath).publicKey

  const getChainCode = (derivationPath) => deriveHdNode(derivationPath).chainCode

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
    return ShelleyTxWitnessShelley(derivePub(path), signature)
  }

  const build_byron_witness = async (tx_body_hash, sign, path, network) => {
    const signature = await sign(tx_body_hash, path)
    // const address_attributes = encode(
    //   network.name === 'mainnet'
    //     ? {}
    //     : new Map().set([PROTOCOL_MAGIC_KEY], encode(network.protocolMagic))
    // ) // TODO:
    const address_attributes = encode({})
    return ShelleyTxWitnessByron(derivePub(path), signature, getChainCode(path), address_attributes)
  }

  const build_witnesses = async (inputs, tx_body_hash, sign, network, addressToAbsPathMapper) => {
    const _shelleyWitnesses = []
    const _byronWitnesses = []
    inputs.forEach((input) => {
      const inputPath = addressToAbsPathMapper(input.address)
      isShelleyPath(inputPath)
        ? _shelleyWitnesses.push(build_shelley_witness(tx_body_hash, inputPath, sign))
        : _byronWitnesses.push(build_byron_witness(tx_body_hash, sign, inputPath, network))
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
      txAux.withdrawals
        ? [...txAux.inputs, ...txAux.certs, txAux.withdrawals]
        : [...txAux.inputs, ...txAux.certs], // TODO: a withdrawal!
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
