import {sign as signMsg, derivePrivate, xpubToHdPassphrase} from 'cardano-crypto.js'

import HdNode from '../helpers/hd-node'
import {buildTransaction} from './helpers/chainlib-wrapper'

const ShelleyJsCryptoProvider = ({walletSecretDef: {rootSecret, derivationScheme}, network}) => {
  const masterHdNode = HdNode(rootSecret)

  const isHwWallet = () => false

  const getDerivationScheme = () => derivationScheme

  const deriveXpub = (derivationPath) => deriveHdNode(derivationPath).extendedPublicKey

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

  async function signTx(txAux, addressToAbsPathMapper) {
    const prepareInput = (utxo) => {
      const path = addressToAbsPathMapper(utxo.address)
      const hdnode = deriveHdNode(path)
      console.log('path', path, 'hd', hdnode.secretKey)

      return {
        type: 'utxo',
        txid: utxo.txHash,
        value: utxo.coins,
        outputNo: utxo.outputIndex,
        address: utxo.address,
        privkey: Buffer.from(hdnode.secretKey).toString('hex'),
        chaincode: Buffer.from(hdnode.chainCode).toString('hex'),
      }
    }

    const prepareOutput = (output) => {
      return {
        address: output.address,
        value: output.coins,
      }
    }

    const inputs = txAux.inputs.map(prepareInput)
    const outputs = [...txAux.outputs, txAux.change].map(prepareOutput)

    const tx = buildTransaction({
      inputs,
      outputs,

      cert: null,
      chainConfig: network.chainConfig,
    })
    console.log(tx)
    return tx
  }

  function getHdPassphrase() {
    return xpubToHdPassphrase(masterHdNode.extendedPublicKey)
  }

  return {
    network,
    signTx,
    getDerivationScheme,
    deriveXpub,
    isHwWallet,
    getHdPassphrase,
    _sign: sign,
    _deriveHdNodeFromRoot: deriveHdNode,
    _deriveChildHdNode: deriveChildHdNode,
  }
}

export default ShelleyJsCryptoProvider
