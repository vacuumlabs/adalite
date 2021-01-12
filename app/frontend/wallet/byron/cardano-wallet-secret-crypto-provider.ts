import {encode} from 'borc'
import {blake2b, sign as signMsg, derivePrivate, xpubToHdPassphrase} from 'cardano-crypto.js'

// eslint-disable-next-line no-unused-vars
import {TxWitness, PkWitness, SignedTransactionStructured} from './byron-transaction'

import HdNode from '../helpers/hd-node'
import {parseTxAux} from './helpers/cbor-parsers'
import NamedError from '../../helpers/NamedError'
import CachedDeriveXpubFactory from '../helpers/CachedDeriveXpubFactory'

// eslint-disable-next-line no-unused-vars
import {DerivationScheme} from '../helpers/derivation-schemes'

const CardanoWalletSecretCryptoProvider = ({
  walletSecretDef: {rootSecret, derivationScheme},
  network,
}) => {
  const masterHdNode = HdNode(rootSecret)

  const isHwWallet = () => false

  function getWalletSecret() {
    return masterHdNode.toBuffer()
  }

  function getDerivationScheme(): DerivationScheme {
    return derivationScheme
  }

  const deriveXpub = CachedDeriveXpubFactory(derivationScheme, false, (derivationPaths) => {
    return derivationPaths.map((path) => deriveHdNode(path).extendedPublicKey)
  })

  function getHdPassphrase() {
    return xpubToHdPassphrase(masterHdNode.extendedPublicKey)
  }

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

  function checkTxInputsIntegrity(txInputs, rawInputTxs) {
    const inputTxs = {}
    for (const rawTx of rawInputTxs) {
      const txHash = blake2b(rawTx, 32).toString('hex')
      inputTxs[txHash] = parseTxAux(rawTx)
    }

    return txInputs
      .map(
        ({txHash, coins, outputIndex}) =>
          inputTxs[txHash] !== undefined && coins === inputTxs[txHash].outputs[outputIndex].coins
      )
      .every((result) => result === true)
  }

  async function signTx(txAux, rawInputTxs, addressToAbsPathMapper) {
    if (!checkTxInputsIntegrity(txAux.inputs, rawInputTxs)) {
      throw NamedError('TransactionRejectedWhileSigning')
    }

    const signedTxStructured = await signTxGetStructured(txAux, addressToAbsPathMapper)

    return {
      txHash: signedTxStructured.getId(),
      txBody: encode(signedTxStructured).toString('hex'),
    }
  }

  async function getWitness(txAuxHash, absPath): Promise<PkWitness> {
    const xpub = await deriveXpub(absPath)

    /*
    * the "01" byte is a constant to denote signatures of transactions
    * the "5820" part is the CBOR prefix for a hex string
    */
    const txSignMessagePrefix = Buffer.concat([
      Buffer.from('01', 'hex'),
      encode(network.protocolMagic),
      Buffer.from('5820', 'hex'),
    ]).toString('hex')

    const signature = await sign(`${txSignMessagePrefix}${txAuxHash}`, absPath)

    return TxWitness(xpub, signature)
  }

  async function signTxGetStructured(txAux, addressToAbsPathMapper) {
    const txHash = txAux.getId()
    const witnesses = await Promise.all(
      txAux.inputs.map((input) => {
        const absPath = addressToAbsPathMapper(input.utxo.address)
        return getWitness(txHash, absPath)
      })
    )

    return SignedTransactionStructured(txAux, witnesses)
  }

  return {
    signTx,
    getWalletSecret,
    getDerivationScheme,
    deriveXpub,
    getHdPassphrase,
    isHwWallet,
    _sign: sign,
    _checkTxInputsIntegrity: checkTxInputsIntegrity,
    _deriveHdNodeFromRoot: deriveHdNode,
    _deriveChildHdNode: deriveChildHdNode,
    _signTxGetStructured: signTxGetStructured,
    network,
  }
}

export default CardanoWalletSecretCryptoProvider
