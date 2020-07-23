/* eslint-disable no-use-before-define */
/* eslint-disable camelcase */
import {sign as signMsg, derivePrivate, xpubToHdPassphrase, blake2b} from 'cardano-crypto.js'
import cbor from 'borc'

import HdNode from '../helpers/hd-node'
import {
  ShelleyTxAux,
  ShelleySignedTransactionStructured,
  build_witnesses,
} from './shelley-transaction'

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

  // eslint-disable-next-line require-await
  async function signTx(txAux, addressToAbsPathMapper) {
    const {inputs, outputs, fee, certs} = txAux
    const witnesses = build_witnesses(inputs, txAux.getId(), sign, network)
    const structured_tx = ShelleySignedTransactionStructured(txAux, witnesses)
    const tx = {transaction: cbor.encode(structured_tx), fragmentId: structured_tx.getId()}
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
