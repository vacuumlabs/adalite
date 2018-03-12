const crc32 = require('crc-32')
const cbor = require('cbor')
const pbkdf2 = require('pbkdf2')
const chacha20 = require('@stablelib/chacha20poly1305')
const base58 = require('bs58')
const crypto = require('crypto')
const EdDsa = require('elliptic-cardano').eddsaVariant
const ec = new EdDsa('ed25519')

const CborIndefiniteLengthArray = require('./helpers').CborIndefiniteLengthArray
const addressHash = require('./utils').addressHash
const tx = require('./transaction')
const {add256NoCarry, scalarAdd256ModM, multiply8} = require('./utils')

// refactor how exports work. First define everything:
// function fn1(){...}
//
// const const2 = ...
//
// class Class3 {...
//
// finally, be explicit about what you want to export at the end of file:
//
// module.exports = {fn1, const2, Class3}
//
// in a case of exporting a single variable, do it such as:
//
// module.exports = fn

function deriveAddressAndSecret(rootSecretString, childIndex) {
  let addressPayload, addressAttributes, derivedSecretString, addressRoot

  if (childIndex === 0x80000000) {
    // root address
    addressPayload = new Buffer(0)
    addressAttributes = new Map()
    derivedSecretString = rootSecretString
    addressRoot = new Buffer(getAddressRoot(derivedSecretString, addressPayload), 'hex')
  } else {
    // the remaining addresses
    const hdPassphrase = deriveHDPassphrase(rootSecretString)
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
    secret: derivedSecretString,
  }
}

function isAddressDerivableFromSecretString(address, rootSecretString) {
  try {
    deriveSecretStringFromAddress(address, rootSecretString)
    return true
  } catch (e) {
    if (e.name === 'AddressDecodingException') {
      return false
    }

    throw e
  }
}

function deriveSecretStringFromAddress(address, rootSecretString) {
  // we decode the address from the base58 string
  // and then we strip the 24 CBOR data taga (the "[0].value" part)
  const addressAsBuffer = cbor.decode(base58.decode(address))[0].value
  const addressData = cbor.decode(addressAsBuffer)
  const addressAttributes = addressData[1]
  const addressPayload = cbor.decode(addressAttributes.get(1))
  const hdPassphrase = deriveHDPassphrase(rootSecretString)
  const derivationPath = decryptDerivationPath(addressPayload, hdPassphrase)
  const childIndex = addressAttributes.length === 0 ? 0x80000000 : derivationPath[1]

  return deriveAddressAndSecret(rootSecretString, childIndex).secret
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

function deriveHDPassphrase(walletSecretString) {
  const extendedPublicKey = new Buffer(
    walletSecretString.getPublicKey() + walletSecretString.getChainCode(),
    'hex'
  )

  const derivedKey = pbkdf2.pbkdf2Sync(extendedPublicKey, 'address-hashing', 500, 32, 'sha512')
  return new Buffer(derivedKey.toString('hex'), 'hex')
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
