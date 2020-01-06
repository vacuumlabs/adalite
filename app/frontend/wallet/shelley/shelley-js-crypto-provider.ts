import {sign as signMsg, derivePrivate, xpubToHdPassphrase} from 'cardano-crypto.js'

import HdNode from '../helpers/hd-node'
import {buildTransaction} from './helpers/chainlib-wrapper'

type HexString = string & {__typeHexString: any}

const ShelleyJsCryptoProvider = ({walletSecretDef: {rootSecret, derivationScheme}, network}) => {
  const masterHdNode = HdNode(rootSecret)

  const isHwWallet = () => false

  const getDerivationScheme = () => derivationScheme

  const deriveXpub = (derivationPath) => deriveHdNode(derivationPath).extendedPublicKey

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

  async function signTx(txAux, addressToAbsPathMapper) {
    const prepareUtxoInput = (input, hdnode) => {
      return {
        type: 'utxo',
        txid: input.txHash,
        value: input.coins,
        outputNo: input.outputIndex,
        address: input.address,
        privkey: Buffer.from(hdnode.secretKey).toString('hex'),
        chaincode: Buffer.from(hdnode.chainCode).toString('hex'),
      }
    }

    const prepareAccountInput = (input, hdnode) => {
      return {
        type: 'account',
        address: input.address,
        privkey: Buffer.from(hdnode.secretKey).toString('hex'),
        accountCounter: input.counter,
        value: input.coins,
      }
    }

    const prepareInput = (type, input) => {
      const path = addressToAbsPathMapper(input.address)
      const hdnode = deriveHdNode(path)
      const inputPreparator = {
        utxo: prepareUtxoInput,
        account: prepareAccountInput,
      }
      return inputPreparator[type](input, hdnode)
    }

    const prepareOutput = (output) => {
      return {
        address: output.address,
        value: output.coins,
      }
    }

    const prepareCert = (input) => {
      return txAux.cert
        ? {
          type: 'stake_delegation',
          privkey: input.privkey,
          pools: txAux.cert.pools,
        }
        : null
    }

    const inputs = txAux.inputs.map((input) => prepareInput(txAux.type, input))
    const outputs = txAux.outputs.length ? [...txAux.outputs, txAux.change].map(prepareOutput) : []
    const cert = prepareCert(inputs[0])

    const tx = buildTransaction({
      inputs,
      outputs,
      cert,
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
    deriveXpriv,
  }
}

export default ShelleyJsCryptoProvider
