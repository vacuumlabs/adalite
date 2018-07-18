const cbor = require('cbor')
const CardanoCrypto = require('cardano-crypto.js')

const pbkdf2 = require('./helpers/pbkdf2')
const {TxWitness, SignedTransactionStructured} = require('./transaction')
const {TX_SIGN_MESSAGE_PREFIX, CARDANO_KEY_DERIVATION_MODE} = require('./constants')
const HdNode = require('./hd-node')
const derivePublic = require('./helpers/derivePublic')
const {packAddress, unpackAddress} = require('./address')

const CardanoMnemonicCryptoProvider = (walletSecret, walletState, disableCaching = false) => {
  const state = Object.assign(walletState, {
    masterHdNode: HdNode({secret: walletSecret}),
    derivedHdNodes: {},
    derivedXpubs: {},
  })

  async function deriveAddresses(derivationPaths, derivationMode) {
    return await Promise.all(
      derivationPaths.map(
        async (derivationPath) => await deriveAddress(derivationPath, derivationMode)
      )
    )
  }

  async function deriveAddress(derivationPath, derivationMode) {
    const xpub = deriveXpub(derivationPath, derivationMode)
    const hdPassphrase = await getRootHdPassphrase()

    return packAddress(derivationPath, xpub, hdPassphrase)
  }

  async function getWalletId() {
    return await deriveAddress([], 'hardened')
  }

  function getWalletSecret() {
    return state.masterHdNode.toBuffer()
  }

  async function getRootHdPassphrase() {
    return await pbkdf2(state.masterHdNode.extendedPublicKey, 'address-hashing', 500, 32, 'sha512')
  }

  function deriveXpub(derivationPath, derivationMode) {
    const memoKey = JSON.stringify(derivationPath)

    if (disableCaching || !state.derivedXpubs[memoKey]) {
      if (derivationMode === 'hardened') {
        state.derivedXpubs[memoKey] = deriveXpubHardened(derivationPath)
      } else if (derivationMode === 'nonhardened') {
        state.derivedXpubs[memoKey] = deriveXpubNonhardened(derivationPath)
      } else {
        throw Error(`Unknown derivation mode: ${derivationMode}`)
      }
    }

    return state.derivedXpubs[memoKey]
  }

  function deriveXpubHardened(derivationPath) {
    return deriveHdNode(derivationPath).extendedPublicKey
  }

  /*
  * derives first n-1 elements of derivation path the hardened way
  * and only the n-th element is derived the nonhardened way
  */
  function deriveXpubNonhardened(derivationPath) {
    const parentPath = derivationPath.slice(0, derivationPath.length - 1)
    const childPath = derivationPath.slice(derivationPath.length - 1, derivationPath.length)

    // this reduce ensures that this would work even for empty derivation path
    return childPath.reduce(derivePublic, deriveXpub(parentPath, 'hardened'))
  }

  function deriveHdNode(derivationPath) {
    const memoKey = JSON.stringify(derivationPath)
    if (disableCaching || !state.derivedHdNodes[memoKey]) {
      if (derivationPath.length > 2) {
        throw Error('Address derivation path should be of length at most 2')
      }

      state.derivedHdNodes[memoKey] = derivationPath.reduce(deriveChildHdNode, state.masterHdNode)
    }

    return state.derivedHdNodes[memoKey]
  }

  function deriveChildHdNode(hdNode, childIndex) {
    const result = CardanoCrypto.derivePrivate(
      hdNode.toBuffer(),
      childIndex,
      CARDANO_KEY_DERIVATION_MODE
    )

    return HdNode({
      secretKey: result.slice(0, 64),
      publicKey: result.slice(64, 96),
      chainCode: result.slice(96, 128),
    })
  }

  async function sign(message, keyDerivationPath) {
    const hdNode = await deriveHdNode(keyDerivationPath)
    const messageToSign = Buffer.from(message, 'hex')

    return CardanoCrypto.sign(messageToSign, hdNode.toBuffer())
  }

  async function signTx(txAux) {
    const signedTxStructured = await signTxGetStructured(txAux)

    return {
      txHash: signedTxStructured.getId(),
      txBody: cbor.encode(signedTxStructured).toString('hex'),
    }
  }

  async function signTxGetStructured(txAux) {
    const txHash = txAux.getId()

    const witnesses = await Promise.all(
      txAux.inputs.map(async (input) => {
        const derivationPath = await getDerivationPathFromAddress(input.utxo.address)
        const xpub = deriveHdNode(derivationPath).extendedPublicKey
        const signature = await sign(`${TX_SIGN_MESSAGE_PREFIX}${txHash}`, derivationPath)

        return TxWitness(xpub, signature)
      })
    )

    return SignedTransactionStructured(txAux, witnesses)
  }

  async function getDerivationPathFromAddress(address) {
    const hdPassphrase = await getRootHdPassphrase()
    return unpackAddress(address, hdPassphrase).derivationPath
  }

  return {
    deriveAddress,
    deriveAddresses,
    signTx,
    getWalletId,
    getWalletSecret,
    getDerivationPathFromAddress,
    _sign: sign,
    _deriveHdNodeFromRoot: deriveHdNode,
    _deriveChildHdNode: deriveChildHdNode,
    _signTxGetStructured: signTxGetStructured,
  }
}

module.exports = CardanoMnemonicCryptoProvider
