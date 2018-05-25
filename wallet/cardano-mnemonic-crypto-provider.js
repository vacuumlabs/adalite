const bigNumber = require('bignumber.js')
const blake2 = require('blakejs')
const crc32 = require('crc-32')
const cbor = require('cbor')
const chacha20 = require('@stablelib/chacha20poly1305')
const base58 = require('bs58')
const crypto = require('crypto')
const EdDsa = require('elliptic-cardano').eddsaVariant
const ec = new EdDsa('ed25519')
const sha3 = require('js-sha3')
const ed25519 = require('supercop.js')

const {pbkdf2Async} = require('./helpers/pbkdf2')
const CborIndefiniteLengthArray = require('./helpers/CborIndefiniteLengthArray')
const tx = require('./transaction')
const {HARDENED_THRESHOLD, TX_SIGN_MESSAGE_PREFIX} = require('./constants')
const {mnemonicToHdNode} = require('./mnemonic')
const range = require('./helpers/range')

const CardanoMnemonicCryptoProvider = (mnemonicOrHdNodeString, walletState) => {
  const state = Object.assign(walletState, {
    masterHdNode:
      mnemonicOrHdNodeString.search(' ') >= 0
        ? mnemonicToHdNode(mnemonicOrHdNodeString)
        : new tx.HdNode({hdNodeString: mnemonicOrHdNodeString}),
    derivedAddresses: {},
  })

  function addressHash(input) {
    const serializedInput = cbor.encode(input)

    const firstHash = Buffer.from(sha3.sha3_256(serializedInput), 'hex')
    return Buffer.from(blake2.blake2b(firstHash, null, 28))
  }

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

  const crc32Unsigned = (input) => crc32.buf(input) >>> 0

  async function deriveAddresses(childIndexBegin, childIndexEnd) {
    return await Promise.all(
      range(childIndexBegin, childIndexEnd).map(async (i) => await deriveAddress(i))
    )
  }

  async function deriveAddress(childIndex) {
    return (await deriveAddressWithHdNode(childIndex)).address
  }

  async function deriveXpub(childIndex) {
    return (await deriveAddressWithHdNode(childIndex)).hdNode.extendedPublicKey
  }

  // works only on addresses derivable from master hdNode
  async function deriveChildIndexFromAddress(address) {
    return (await deriveHdNodeAndChildIndexFromAddress(address)).childIndex
  }

  async function deriveAddressWithHdNode(childIndex) {
    if (!state.derivedAddresses[childIndex]) {
      let addressPayload, addressAttributes, derivedHdNode

      if (childIndex === HARDENED_THRESHOLD) {
        // root address
        addressPayload = Buffer.from([])
        addressAttributes = new Map()
        derivedHdNode = state.masterHdNode
      } else {
        // the remaining addresses
        const hdPassphrase = await deriveHdPassphrase(state.masterHdNode)
        const derivationPath = [HARDENED_THRESHOLD, childIndex]

        addressPayload = encryptDerivationPath(derivationPath, hdPassphrase)
        addressAttributes = new Map([[1, cbor.encode(addressPayload)]])
        derivedHdNode = deriveHdNode(childIndex)
      }
      const addressRoot = getAddressRoot(derivedHdNode, addressPayload)
      const addressType = 0 // Public key address
      const addressData = [addressRoot, addressAttributes, addressType]
      const addressDataEncoded = cbor.encode(addressData)
      const address = base58.encode(
        cbor.encode([new cbor.Tagged(24, addressDataEncoded), crc32Unsigned(addressDataEncoded)])
      )

      state.derivedAddresses[childIndex] = {
        address,
        childIndex,
        hdNode: derivedHdNode,
      }
    }

    return state.derivedAddresses[childIndex]
  }

  async function isOwnAddress(address) {
    try {
      await deriveHdNodeAndChildIndexFromAddress(address)
      return true
    } catch (e) {
      if (e.name === 'AddressDecodingException') {
        return false
      }

      throw e
    }
  }

  async function deriveHdNodeAndChildIndexFromAddress(address) {
    // we decode the address from the base58 string
    // and then we strip the 24 CBOR data tags (the "[0].value" part)
    const addressAsBuffer = cbor.decode(base58.decode(address))[0].value
    const addressData = cbor.decode(addressAsBuffer)
    const addressAttributes = addressData[1]
    const addressPayload = cbor.decode(addressAttributes.get(1))
    const hdPassphrase = await deriveHdPassphrase(state.masterHdNode)
    const derivationPath = decryptDerivationPath(addressPayload, hdPassphrase)
    const childIndex = addressAttributes.length === 0 ? HARDENED_THRESHOLD : derivationPath[1]

    return await deriveAddressWithHdNode(childIndex)
  }

  function deriveHdNode(childIndex) {
    const firstRound = deriveHdNodeIteration(state.masterHdNode, HARDENED_THRESHOLD)

    if (childIndex === HARDENED_THRESHOLD) {
      throw new Error('Do not use deriveHdNode to derive root node')
    }

    return deriveHdNodeIteration(firstRound, childIndex)
  }

  function getAddressRoot(hdNode, addressPayload) {
    const extendedPublicKey = hdNode.extendedPublicKey

    return addressHash([
      0,
      [0, extendedPublicKey],
      addressPayload.length > 0 ? new Map([[1, cbor.encode(addressPayload)]]) : new Map(),
    ])
  }

  function encryptDerivationPath(derivationPath, hdPassphrase) {
    const serializedDerivationPath = cbor.encode(new CborIndefiniteLengthArray(derivationPath))

    const cipher = new chacha20.ChaCha20Poly1305(hdPassphrase)

    return Buffer.from(cipher.seal(Buffer.from('serokellfore'), serializedDerivationPath))
  }

  function decryptDerivationPath(addressPayload, hdPassphrase) {
    const cipher = new chacha20.ChaCha20Poly1305(hdPassphrase)
    const decipheredDerivationPath = cipher.open(Buffer.from('serokellfore'), addressPayload)

    try {
      return cbor.decode(Buffer.from(decipheredDerivationPath))
    } catch (err) {
      const e = new Error('incorrect address or passphrase')
      e.name = 'AddressDecodingException'
      throw e
    }
  }

  async function deriveHdPassphrase(hdNode) {
    return await pbkdf2Async(hdNode.extendedPublicKey, 'address-hashing', 500, 32, 'sha512')
  }

  function deriveHdNodeIteration(hdNode, childIndex) {
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

    return new tx.HdNode({secretKey: resKey, publicKey: newPublicKey, chainCode: newChainCode})
  }

  function indexIsHardened(childIndex) {
    return !!(childIndex >> 31)
  }

  async function sign(message, childIndex) {
    const hdNode = (await deriveAddressWithHdNode(childIndex)).hdNode
    const messageToSign = Buffer.from(message, 'hex')

    return ed25519.sign(messageToSign, hdNode.publicKey, hdNode.secretKey)
  }

  async function signTx(unsignedTx) {
    const signedTxStructured = await signTxGetStructured(unsignedTx)

    return {
      txHash: signedTxStructured.getId(),
      txBody: cbor.encode(signedTxStructured).toString('hex'),
    }
  }

  async function signTxGetStructured(unsignedTx) {
    const txHash = tx.getTxId(unsignedTx)

    const witnesses = await Promise.all(
      unsignedTx.inputs.map(async (input) => {
        const childIndex = await deriveChildIndexFromAddress(input.utxo.address)
        const xpub = await deriveXpub(childIndex)
        const signature = await sign(`${TX_SIGN_MESSAGE_PREFIX}${txHash}`, childIndex)

        return tx.TxWitness(xpub, signature)
      })
    )

    return tx.SignedTransactionStructured(unsignedTx, witnesses)
  }

  return {
    deriveAddress,
    deriveAddresses,
    deriveAddressWithHdNode,
    isOwnAddress,
    deriveXpub,
    deriveChildIndexFromAddress,
    signTx,
    _sign: sign,
    _deriveHdNode: deriveHdNode,
    _signTxGetStructured: signTxGetStructured,
  }
}

module.exports = CardanoMnemonicCryptoProvider
