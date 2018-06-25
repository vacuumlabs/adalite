const bigNumber = require('bignumber.js')
const cbor = require('cbor')
const crypto = require('crypto')
const EdDsa = require('elliptic-cardano').eddsaVariant
const ec = new EdDsa('ed25519')
const ed25519 = require('supercop.js')

const {pbkdf2Async} = require('./helpers/pbkdf2')
const {TxWitness, SignedTransactionStructured} = require('./transaction')
const {TX_SIGN_MESSAGE_PREFIX} = require('./constants')
const {HdNode, mnemonicToHdNode, hdNodeStringToHdNode} = require('./hd-node')
const derivePublic = require('./helpers/derivePublic')
const {packAddress, unpackAddress} = require('./address')

const CardanoMnemonicCryptoProvider = (mnemonicOrHdNodeString, walletState) => {
  const state = Object.assign(walletState, {
    masterHdNode:
      mnemonicOrHdNodeString.search(' ') >= 0
        ? mnemonicToHdNode(mnemonicOrHdNodeString)
        : hdNodeStringToHdNode(mnemonicOrHdNodeString),
    derivedHdNodes: {},
    derivedXpubs: {},
  })

  function add256NoCarry(b1, b2) {
    let result = ''

    for (let i = 0; i < 32; i++) {
      result += ((b1[i] + b2[i]) & 0xff).toString(16).padStart(2, '0')
    }

    return Buffer.from(result, 'hex')
  }

  function toLittleEndian(str) {
    // from https://stackoverflow.com/questions/7946094/swap-endianness-javascript
    const s = str.replace(/^(.(..)*)$/, '0$1') // add a leading zero if needed
    const a = s.match(/../g) // split number in groups of two
    a.reverse() // reverse the goups
    return a.join('') // join the groups back together
  }

  function scalarAdd256ModM(b1, b2) {
    let resultAsHexString = bigNumber(toLittleEndian(b1.toString('hex')), 16)
      .plus(bigNumber(toLittleEndian(b2.toString('hex')), 16))
      .mod(bigNumber('1000000000000000000000000000000014def9dea2f79cd65812631a5cf5d3ed', 16))
      .toString(16)
    resultAsHexString = toLittleEndian(resultAsHexString).padEnd(64, '0')

    return Buffer.from(resultAsHexString, 'hex')
  }

  function multiply8(buf) {
    let result = ''
    let prevAcc = 0

    for (let i = 0; i < buf.length; i++) {
      result += ((((buf[i] * 8) & 0xff) + (prevAcc & 0x8)) & 0xff).toString(16).padStart(2, '0')
      prevAcc = buf[i] * 32
    }

    return Buffer.from(result, 'hex')
  }

  async function deriveAddresses(derivationPaths, derivationMode) {
    return await Promise.all(
      derivationPaths.map(
        async (derivationPath) => await deriveAddress(derivationPath, derivationMode)
      )
    )
  }

  async function deriveAddress(derivationPath, derivationMode) {
    const xpub = deriveXpub(derivationPath, derivationMode)
    const hdPassphrase = await getHdPassphrase()

    return packAddress(derivationPath, xpub, hdPassphrase)
  }

  async function getWalletId() {
    return await deriveAddress([], 'hardened')
  }

  async function getHdPassphrase() {
    return await pbkdf2Async(
      state.masterHdNode.extendedPublicKey,
      'address-hashing',
      500,
      32,
      'sha512'
    )
  }

  function deriveXpub(derivationPath, derivationMode) {
    const memoKey = JSON.stringify(derivationPath)

    if (!state.derivedXpubs[memoKey]) {
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
    if (!state.derivedHdNodes[memoKey]) {
      if (derivationPath.length > 2) {
        throw Error('Address derivation path should be of length at most 2')
      }

      state.derivedHdNodes[memoKey] = derivationPath.reduce(deriveChildHdNode, state.masterHdNode)
    }

    return state.derivedHdNodes[memoKey]
  }

  function deriveChildHdNode(hdNode, childIndex) {
    const chainCode = hdNode.chainCode

    const hmac1 = crypto.createHmac('sha512', chainCode)

    if (indexIsHardened(childIndex)) {
      hmac1.update(Buffer.from([0x00])) // TAG_DERIVE_Z_HARDENED
      hmac1.update(hdNode.secretKey)
    } else {
      hmac1.update(Buffer.from([0x02])) // TAG_DERIVE_Z_NORMAL
      hmac1.update(hdNode.publicKey)
    }
    hmac1.update(Buffer.from(childIndex.toString(16).padStart(8, '0'), 'hex'))
    const z = Buffer.from(hmac1.digest('hex'), 'hex')

    const zl8 = multiply8(z, Buffer.from([0x08])).slice(0, 32)
    const parentKey = hdNode.secretKey

    const kl = scalarAdd256ModM(zl8, parentKey.slice(0, 32))
    const kr = add256NoCarry(z.slice(32, 64), parentKey.slice(32, 64))

    const resKey = Buffer.concat([kl, kr])

    const hmac2 = crypto.createHmac('sha512', chainCode)

    if (indexIsHardened(childIndex)) {
      hmac2.update(Buffer.from([0x01])) // TAG_DERIVE_CC_HARDENED
      hmac2.update(hdNode.secretKey)
    } else {
      hmac2.update(Buffer.from([0x03])) // TAG_DERIVE_CC_NORMAL
      hmac2.update(hdNode.publicKey)
    }
    hmac2.update(Buffer.from(childIndex.toString(16).padStart(8, '0'), 'hex'))

    const newChainCode = Buffer.from(hmac2.digest('hex').slice(64, 128), 'hex')
    const newPublicKey = Buffer.from(
      ec.keyFromSecret(resKey.toString('hex').slice(0, 64)).getPublic('hex'),
      'hex'
    )

    const result = HdNode({secretKey: resKey, publicKey: newPublicKey, chainCode: newChainCode})

    return result
  }

  function indexIsHardened(childIndex) {
    return !!(childIndex >> 31)
  }

  async function sign(message, keyDerivationPath) {
    const hdNode = await deriveHdNode(keyDerivationPath)
    const messageToSign = Buffer.from(message, 'hex')

    return ed25519.sign(messageToSign, hdNode.publicKey, hdNode.secretKey)
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
        const hdPassphrase = await getHdPassphrase()
        const derivationPath = unpackAddress(input.utxo.address, hdPassphrase).derivationPath
        const xpub = deriveHdNode(derivationPath).extendedPublicKey
        const signature = await sign(`${TX_SIGN_MESSAGE_PREFIX}${txHash}`, derivationPath)

        return TxWitness(xpub, signature)
      })
    )

    return SignedTransactionStructured(txAux, witnesses)
  }

  return {
    deriveAddress,
    deriveAddresses,
    signTx,
    getWalletId,
    _sign: sign,
    _deriveHdNodeFromRoot: deriveHdNode,
    _deriveChildHdNode: deriveChildHdNode,
    _signTxGetStructured: signTxGetStructured,
  }
}

module.exports = CardanoMnemonicCryptoProvider
