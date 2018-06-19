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
const {TxWitness, SignedTransactionStructured} = require('./transaction')
const {HARDENED_THRESHOLD, TX_SIGN_MESSAGE_PREFIX} = require('./constants')
const {HdNode, mnemonicToHdNode, hdNodeStringToHdNode} = require('./hd-node')

const CardanoMnemonicCryptoProvider = (mnemonicOrHdNodeString, walletState) => {
  const state = Object.assign(walletState, {
    masterHdNode:
      mnemonicOrHdNodeString.search(' ') >= 0
        ? mnemonicToHdNode(mnemonicOrHdNodeString)
        : hdNodeStringToHdNode(mnemonicOrHdNodeString),
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

  async function deriveAddresses(derivationPaths) {
    return await Promise.all(
      derivationPaths.map(async (derivationPath) => await deriveAddress(derivationPath))
    )
  }

  async function deriveAddress(derivationPath) {
    return (await deriveAddressWithHdNode(derivationPath)).address
  }

  // works only on addresses derivable from master hdNode
  async function getDerivationPathFromAddress(address) {
    return (await deriveHdNodeAndDerivationPathFromAddress(address)).derivationPath
  }

  async function getWalletId() {
    return (await deriveAddressWithHdNode([])).address
  }

  async function deriveAddressWithHdNode(derivationPath) {
    if (!state.derivedAddresses[JSON.stringify(derivationPath)]) {
      let addressPayload, addressAttributes
      if (derivationPath.length > 0) {
        const hdPassphrase = await getHdPassphrase()
        addressPayload = encryptDerivationPath(derivationPath, hdPassphrase)
        addressAttributes = new Map([[1, cbor.encode(addressPayload)]])
      } else {
        addressPayload = Buffer.from([])
        addressAttributes = new Map()
      }
      const derivedHdNode = deriveHdNodeFromRoot(derivationPath)

      const addressRoot = getAddressRoot(derivedHdNode, addressPayload)
      const addressType = 0 // Public key address
      const addressData = [addressRoot, addressAttributes, addressType]
      const addressDataEncoded = cbor.encode(addressData)
      const address = base58.encode(
        cbor.encode([new cbor.Tagged(24, addressDataEncoded), crc32Unsigned(addressDataEncoded)])
      )

      state.derivedAddresses[JSON.stringify(derivationPath)] = {
        address,
        derivationPath,
        hdNode: derivedHdNode,
      }
    }

    return state.derivedAddresses[JSON.stringify(derivationPath)]
  }

  async function isOwnAddress(address) {
    try {
      await deriveHdNodeAndDerivationPathFromAddress(address)
      return true
    } catch (e) {
      if (e.name === 'AddressDecodingException') {
        return false
      }

      throw e
    }
  }

  async function deriveHdNodeAndDerivationPathFromAddress(address) {
    // we decode the address from the base58 string
    // and then we strip the 24 CBOR data tags (the "[0].value" part)
    const addressAsBuffer = cbor.decode(base58.decode(address))[0].value
    const addressData = cbor.decode(addressAsBuffer)
    const addressAttributes = addressData[1]
    const addressPayload = cbor.decode(addressAttributes.get(1))
    const hdPassphrase = await getHdPassphrase()
    const derivationPath = decryptDerivationPath(addressPayload, hdPassphrase)

    if (derivationPath.length > 2) {
      throw Error('Wrong derivation path length, should be at most 2')
    }

    return await deriveAddressWithHdNode(derivationPath)
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

  async function getHdPassphrase() {
    return await pbkdf2Async(
      state.masterHdNode.extendedPublicKey,
      'address-hashing',
      500,
      32,
      'sha512'
    )
  }

  function deriveHdNodeFromRoot(derivationPath) {
    if (derivationPath.length > 2) {
      throw Error('Address derivation path should be of length at most 2')
    }

    return derivationPath.reduce(deriveChildHdNode, state.masterHdNode)
  }

  function deriveXpub(derivationPath) {
    return deriveHdNodeFromRoot(derivationPath).extendedPublicKey
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

    return HdNode({secretKey: resKey, publicKey: newPublicKey, chainCode: newChainCode})
  }

  function indexIsHardened(childIndex) {
    return !!(childIndex >> 31)
  }

  async function sign(message, pkDerivationPath) {
    const hdNode = (await deriveAddressWithHdNode(pkDerivationPath)).hdNode
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
        const derivationPath = await getDerivationPathFromAddress(input.utxo.address)
        const xpub = deriveXpub(derivationPath)
        const signature = await sign(`${TX_SIGN_MESSAGE_PREFIX}${txHash}`, derivationPath)

        return TxWitness(xpub, signature)
      })
    )

    return SignedTransactionStructured(txAux, witnesses)
  }

  return {
    deriveAddress,
    deriveAddresses,
    isOwnAddress,
    getDerivationPathFromAddress,
    signTx,
    getWalletId,
    _sign: sign,
    _deriveHdNode: (addressIndex) => deriveHdNodeFromRoot([HARDENED_THRESHOLD, addressIndex]),
    _signTxGetStructured: signTxGetStructured,
  }
}

module.exports = CardanoMnemonicCryptoProvider
