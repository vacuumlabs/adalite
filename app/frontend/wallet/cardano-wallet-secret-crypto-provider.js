const cbor = require('borc')
const {
  blake2b,
  sign: signMsg,
  derivePublic,
  derivePrivate,
  xpubToHdPassphrase,
} = require('cardano-crypto.js')

const {TxWitness, SignedTransactionStructured} = require('./transaction')
const HdNode = require('./hd-node')
const {parseTxAux} = require('./helpers/cbor-parsers')
const NamedError = require('../helpers/NamedError')
const {NETWORKS} = require('./constants')
const indexIsHardened = require('./helpers/indexIsHardened')

const CardanoWalletSecretCryptoProvider = (params, walletState, disableCaching = false) => {
  const state = Object.assign(walletState, {
    masterHdNode: HdNode({secret: params.walletSecret}),
    derivedHdNodes: {},
    derivedXpubs: {},
    derivedAddresses: {},
    network: params.network,
    derivationScheme: params.derivationScheme,
  })

  function getWalletSecret() {
    return state.masterHdNode.toBuffer()
  }

  function deriveXpub(derivationPath) {
    const memoKey = JSON.stringify(derivationPath)

    if (!state.derivedXpubs[memoKey]) {
      const deriveHardened =
        derivationPath.length === 0 || indexIsHardened(derivationPath[derivationPath.length - 1])

      state.derivedXpubs[memoKey] = deriveHardened
        ? deriveXpubHardened(derivationPath)
        : deriveXpubNonHardened(derivationPath)
    }

    return state.derivedXpubs[memoKey]
  }

  function deriveXpubHardened(derivationPath) {
    return deriveHdNode(derivationPath).extendedPublicKey
  }

  function deriveXpubNonHardened(derivationPath) {
    const lastIndex = derivationPath[derivationPath.length - 1]
    const parentXpub = deriveXpub(derivationPath.slice(0, derivationPath.length - 1))

    return derivePublic(parentXpub, lastIndex, state.derivationScheme.number)
  }

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
    const result = derivePrivate(hdNode.toBuffer(), childIndex, state.derivationScheme.number)

    return HdNode({
      secretKey: result.slice(0, 64),
      publicKey: result.slice(64, 96),
      chainCode: result.slice(96, 128),
    })
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
      throw NamedError('TransactionRejected')
    }

    const signedTxStructured = await signTxGetStructured(txAux, addressToAbsPathMapper)

    return {
      txHash: signedTxStructured.getId(),
      txBody: cbor.encode(signedTxStructured).toString('hex'),
    }
  }

  async function signTxGetStructured(txAux, addressToAbsPathMapper) {
    const txHash = txAux.getId()

    const witnesses = await Promise.all(
      txAux.inputs.map(async (input) => {
        const absoluteDerivationPath = addressToAbsPathMapper(input.utxo.address)
        const xpub = deriveHdNode(absoluteDerivationPath).extendedPublicKey
        const protocolMagic = NETWORKS[state.network].protocolMagic

        /*
        * the "01" byte is a constant to denote signatures of transactions
        * the "5820" part is the CBOR prefix for a hex string
        */
        const txSignMessagePrefix = Buffer.concat([
          Buffer.from('01', 'hex'),
          cbor.encode(protocolMagic),
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
    deriveXpub,
    getHdPassphrase,
    _sign: sign,
    _checkTxInputsIntegrity: checkTxInputsIntegrity,
    _deriveHdNodeFromRoot: deriveHdNode,
    _deriveChildHdNode: deriveChildHdNode,
    _signTxGetStructured: signTxGetStructured,
  }
}

module.exports = CardanoWalletSecretCryptoProvider
