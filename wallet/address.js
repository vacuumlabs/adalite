const bigNumber = require('bignumber.js')
const blake2 = require('blakejs')
const {Buffer} = require('buffer/')
const crc32 = require('crc-32')
const cbor = require('cbor')
const {pbkdf2Async} = require('./helpers/pbkdf2')
const chacha20 = require('@stablelib/chacha20poly1305')
const base58 = require('bs58')
const crypto = require('crypto')
const EdDsa = require('elliptic-cardano').eddsaVariant
const ec = new EdDsa('ed25519')
const sha3 = require('js-sha3')

const CborIndefiniteLengthArray = require('./helpers/CborIndefiniteLengthArray')
const tx = require('./transaction')


function addressHash(input) {
  const serializedInput = cbor.encode(input)

  const firstHash = new Buffer(sha3.sha3_256(serializedInput), 'hex')

  const context = blake2.blake2bInit(28) // blake2b-224
  blake2.blake2bUpdate(context, firstHash)

  return new Buffer(blake2.blake2bFinal(context)).toString('hex')
}

function add256NoCarry(b1, b2) {
  let result = ''

  for (let i = 0; i < 32; i++) {
    result += ((b1[i] + b2[i]) & 0xff).toString(16).padStart(2, '0')
  }

  return new Buffer(result, 'hex')
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

  return new Buffer(resultAsHexString, 'hex')
}

function multiply8(buf) {
  let result = ''
  let prevAcc = 0

  for (let i = 0; i < buf.length; i++) {
    result += ((((buf[i] * 8) & 0xff) + (prevAcc & 0x8)) & 0xff).toString(16).padStart(2, '0')
    prevAcc = buf[i] * 32
  }

  return new Buffer(result, 'hex')
}

async function deriveAddressAndSecret(rootSecretString, childIndex) {
  let addressPayload, addressAttributes, derivedSecretString, addressRoot

  if (childIndex === 0x80000000) {
    // root address
    addressPayload = new Buffer(0)
    addressAttributes = new Map()
    derivedSecretString = rootSecretString
    addressRoot = new Buffer(getAddressRoot(derivedSecretString, addressPayload), 'hex')
  } else {
    // the remaining addresses
    const hdPassphrase = await deriveHDPassphrase(rootSecretString)
    derivedSecretString = deriveSK(rootSecretString, childIndex)
    const derivationPath = [0x80000000, childIndex]

    const addressPayload = encryptDerivationPath(derivationPath, hdPassphrase)
    addressAttributes = new Map([[1, cbor.encode(addressPayload)]])
    addressRoot = new Buffer(getAddressRoot(derivedSecretString, addressPayload), 'hex')
  }

  const addressType = 0 // Public key address

  const addressData = [addressRoot, addressAttributes, addressType]

  const addressDataEncoded = new Buffer(cbor.encode(addressData), 'hex')

  const address = base58.encode(
    cbor.encode([new cbor.Tagged(24, addressDataEncoded), getCheckSum(addressDataEncoded)])
  )

  return {
    address,
    childIndex,
    secret: derivedSecretString,
  }
}

async function isAddressDerivableFromSecretString(address, rootSecretString) {
  try {
    await deriveSecretStringFromAddress(address, rootSecretString)
    return true
  } catch (e) {
    if (e.name === 'AddressDecodingException') {
      return false
    }

    throw e
  }
}

async function deriveSecretStringFromAddress(address, rootSecretString) {
  // we decode the address from the base58 string
  // and then we strip the 24 CBOR data taga (the "[0].value" part)
  const addressAsBuffer = cbor.decode(base58.decode(address))[0].value
  const addressData = cbor.decode(addressAsBuffer)
  const addressAttributes = addressData[1]
  const addressPayload = cbor.decode(addressAttributes.get(1))
  const hdPassphrase = await deriveHDPassphrase(rootSecretString)
  const derivationPath = decryptDerivationPath(addressPayload, hdPassphrase)
  const childIndex = addressAttributes.length === 0 ? 0x80000000 : derivationPath[1]

  return (await deriveAddressAndSecret(rootSecretString, childIndex)).secret
}

function deriveSK(rootSecretString, childIndex) {
  const firstround = deriveSkIteration(rootSecretString, 0x80000000)

  if (childIndex === 0x80000000) {
    return firstround
  }

  return deriveSkIteration(firstround, childIndex)
}

function getAddressRoot(walletSecretString, addressPayload) {
  const extendedPublicKey = new Buffer(
    walletSecretString.getPublicKey() + walletSecretString.getChainCode(),
    'hex'
  )

  return addressHash([
    0,
    [0, extendedPublicKey],
    addressPayload.length > 0 ? new Map([[1, cbor.encode(addressPayload)]]) : new Map(),
  ])
}

function encryptDerivationPath(derivationPath, hdPassphrase) {
  const serializedDerivationPath = cbor.encode(new CborIndefiniteLengthArray(derivationPath))

  const cipher = new chacha20.ChaCha20Poly1305(hdPassphrase)

  return new Buffer(cipher.seal(new Buffer('serokellfore'), serializedDerivationPath))
}

function decryptDerivationPath(addressPayload, hdPassphrase) {
  const cipher = new chacha20.ChaCha20Poly1305(hdPassphrase)
  const decipheredDerivationPath = cipher.open(new Buffer('serokellfore'), addressPayload)

  try {
    return cbor.decode(new Buffer(decipheredDerivationPath))
  } catch (err) {
    const e = new Error('incorrect address or passphrase')
    e.name = 'AddressDecodingException'
    throw e
  }
}

function getCheckSum(input) {
  return crc32.buf(input) >>> 0
}

async function deriveHDPassphrase(walletSecretString) {
  const extendedPublicKey = new Buffer(
    walletSecretString.getPublicKey() + walletSecretString.getChainCode(),
    'hex'
  )

  return await pbkdf2Async(extendedPublicKey, 'address-hashing', 500, 32, 'SHA-512')
}

function deriveSkIteration(parentSecretString, childIndex) {
  const chainCode = new Buffer(parentSecretString.getChainCode(), 'hex')

  const hmac1 = crypto.createHmac('sha512', chainCode)

  if (indexIsHardened(childIndex)) {
    hmac1.update(new Buffer('00', 'hex')) // TAG_DERIVE_Z_HARDENED
    hmac1.update(new Buffer(parentSecretString.getSecretKey(), 'hex'))
  } else {
    hmac1.update(new Buffer('02', 'hex')) // TAG_DERIVE_Z_NORMAL
    hmac1.update(new Buffer(parentSecretString.getPublicKey(), 'hex'))
  }
  hmac1.update(new Buffer(childIndex.toString(16).padStart(8, '0'), 'hex'))
  const z = new Buffer(hmac1.digest('hex'), 'hex')

  const zl8 = multiply8(z, new Buffer('08', 'hex')).slice(0, 32)
  const parentKey = new Buffer(parentSecretString.getSecretKey(), 'hex')

  const kl = scalarAdd256ModM(zl8, parentKey.slice(0, 32))
  const kr = add256NoCarry(z.slice(32, 64), parentKey.slice(32, 64))

  const resKey = Buffer.concat([kl, kr])

  const hmac2 = crypto.createHmac('sha512', chainCode)

  if (indexIsHardened(childIndex)) {
    hmac2.update(new Buffer('01', 'hex')) // TAG_DERIVE_CC_HARDENED
    hmac2.update(new Buffer(parentSecretString.getSecretKey(), 'hex'))
  } else {
    hmac2.update(new Buffer('03', 'hex')) // TAG_DERIVE_CC_NORMAL
    hmac2.update(new Buffer(parentSecretString.getPublicKey(), 'hex'))
  }
  hmac2.update(new Buffer(childIndex.toString(16).padStart(8, '0'), 'hex'))

  const newChainCode = new Buffer(hmac2.digest('hex').slice(64, 128), 'hex')
  const newPublicKey = new Buffer(
    ec.keyFromSecret(resKey.toString('hex').slice(0, 64)).getPublic('hex'),
    'hex'
  )

  return new tx.WalletSecretString(
    Buffer.concat([resKey, newPublicKey, newChainCode]).toString('hex')
  )
}

function indexIsHardened(childIndex) {
  return !!(childIndex >> 31)
}

module.exports = {
  deriveAddressAndSecret,
  isAddressDerivableFromSecretString,
  deriveSecretStringFromAddress,
  deriveSK,
  encryptDerivationPath,
}
