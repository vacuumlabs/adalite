import {encode} from 'borc'
import {blake2b, sign as signMsg, derivePrivate, xpubToHdPassphrase} from 'cardano-crypto.js'

import {TxWitness, SignedTransactionStructured} from '../byron-transaction'

import HdNode from './hd-node'
import {parseTxAux} from '../helpers/cbor-parsers'
import NamedError from '../../helpers/NamedError'
import CachedDeriveXpubFactory from './CachedDeriveXpubFactory'

const CardanoWalletSecretCryptoProvider = (
  {walletSecretDef: {rootSecret, derivationScheme}, network},
  walletState,
  disableCaching = false
) => {
  const state = Object.assign(walletState, {
    masterHdNode: HdNode(rootSecret),
    derivedHdNodes: {},
    network,
    derivationScheme,
  })

  const isHwWallet = () => false

  function getWalletSecret() {
    return state.masterHdNode.toBuffer()
  }

  function getDerivationScheme() {
    return state.derivationScheme
  }

  const deriveXpub = CachedDeriveXpubFactory(
    state.derivationScheme,
    (derivationPath) => deriveHdNode(derivationPath).extendedPublicKey
  )

  function getHdPassphrase() {
    return xpubToHdPassphrase(state.masterHdNode.extendedPublicKey)
  }

  function deriveHdNode(derivationPath) {
    const memoKey = JSON.stringify(derivationPath)
    if (disableCaching || !state.derivedHdNodes[memoKey]) {
      state.derivedHdNodes[memoKey] = derivationPath.reduce(deriveChildHdNode, state.masterHdNode)
    }

    return state.derivedHdNodes[memoKey]
  }

  function deriveChildHdNode(hdNode, childIndex) {
    const result = derivePrivate(hdNode.toBuffer(), childIndex, state.derivationScheme.ed25519Mode)

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

  async function signTxGetStructured(txAux, addressToAbsPathMapper) {
    const txHash = txAux.getId()
    const witnesses = await Promise.all(
      txAux.inputs.map(async (input) => {
        const absoluteDerivationPath = addressToAbsPathMapper(input.utxo.address)
        const xpub = await deriveXpub(absoluteDerivationPath)
        const protocolMagic = state.network.protocolMagic

        /*
        * the "01" byte is a constant to denote signatures of transactions
        * the "5820" part is the CBOR prefix for a hex string
        */
        const txSignMessagePrefix = Buffer.concat([
          Buffer.from('01', 'hex'),
          encode(protocolMagic),
          Buffer.from('5820', 'hex'),
        ]).toString('hex')

        const signature = await sign(`${txSignMessagePrefix}${txHash}`, absoluteDerivationPath)

        return TxWitness(xpub, signature)
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
  }
}

export default CardanoWalletSecretCryptoProvider
