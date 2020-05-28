import {sign as signMsg, derivePrivate, xpubToHdPassphrase} from 'cardano-crypto.js'

import HdNode from '../helpers/hd-node'
import {buildTransaction} from './helpers/chainlib-wrapper'

type HexString = string & {__typeHexString: any}

const ShelleyJsCryptoProvider = ({walletSecretDef: {rootSecret, derivationScheme}, network}) => {
  const masterHdNode = HdNode(rootSecret)

  const isHwWallet = () => false

  const getWalletSecret = () => masterHdNode.toBuffer()

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
        type: input.type,
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
        type: input.type,
        address: input.address,
        privkey: Buffer.from(hdnode.secretKey).toString('hex'),
        accountCounter: input.counter,
        value: input.coins,
      }
    }

    const prepareInput = (input) => {
      const path = addressToAbsPathMapper(input.address)
      const hdnode = deriveHdNode(path)
      const inputPreparator = {
        utxo: prepareUtxoInput,
        account: prepareAccountInput,
      }
      return inputPreparator[input.type](input, hdnode)
    }

    const prepareOutput = ({address, coins}) => {
      return {
        address,
        value: coins,
      }
    }

    const prepareCert = ({type, pools}) => {
      const path = addressToAbsPathMapper(txAux.cert.accountAddress)
      const hdnode = deriveHdNode(path)
      return {
        type: 'stake_delegation',
        privkey: Buffer.from(hdnode.secretKey).toString('hex') as HexString,
        pools,
      }
    }

    // const inputs = txAux.inputs.map((input) => prepareInput(txAux.type, input))
    const inputs = txAux.inputs.map(prepareInput)
    const outpustAndChange = txAux.change ? [...txAux.outputs, txAux.change] : [...txAux.outputs]
    const outputs = outpustAndChange.length ? outpustAndChange.map(prepareOutput) : []
    const cert = txAux.cert ? prepareCert(txAux.cert) : null

    const tx = buildTransaction({
      inputs,
      outputs,
      cert,
      chainConfig: network.chainConfig,
    })
    return tx
  }

  function getHdPassphrase() {
    return xpubToHdPassphrase(masterHdNode.extendedPublicKey)
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
