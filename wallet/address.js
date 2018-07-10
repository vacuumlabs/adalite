const cbor = require('cbor')
const blake2 = require('blakejs')
const sha3 = require('js-sha3')
const chacha20 = require('@stablelib/chacha20poly1305')
const base58 = require('bs58')
const crc32 = require('crc-32')

const CborIndefiniteLengthArray = require('./helpers/CborIndefiniteLengthArray')

function isValidAddress(address) {
  try {
    // we decode the address from the base58 string
    // and then we strip the 24 CBOR data taga (the "[0].value" part)
    const addressAsBuffer = cbor.decode(base58.decode(address))[0].value
    const addressData = cbor.decode(addressAsBuffer)
    const addressAttributes = addressData[1]
    cbor.decode(addressAttributes.get(1))
  } catch (e) {
    return false
  }
  return true
}

function getAddressHash(input) {
  const serializedInput = cbor.encode(input)

  const firstHash = Buffer.from(sha3.sha3_256(serializedInput), 'hex')
  return Buffer.from(blake2.blake2b(firstHash, null, 28))
}

function crc32Unsigned(input) {
  return crc32.buf(input) >>> 0
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

function packAddress(derivationPath, xpub, hdPassphrase) {
  let addressPayload, addressAttributes
  if (derivationPath.length > 0) {
    addressPayload = encryptDerivationPath(derivationPath, hdPassphrase)
    addressAttributes = new Map([[1, cbor.encode(addressPayload)]])
  } else {
    addressPayload = Buffer.from([])
    addressAttributes = new Map()
  }
  const addressRoot = getAddressHash([
    0,
    [0, xpub],
    addressPayload.length > 0 ? new Map([[1, cbor.encode(addressPayload)]]) : new Map(),
  ])
  const addressType = 0 // Public key address
  const addressData = [addressRoot, addressAttributes, addressType]
  const addressDataEncoded = cbor.encode(addressData)

  return base58.encode(
    cbor.encode([new cbor.Tagged(24, addressDataEncoded), crc32Unsigned(addressDataEncoded)])
  )
}

function unpackAddress(address, hdPassphrase) {
  // we decode the address from the base58 string
  // and then we strip the 24 CBOR data tags (the "[0].value" part)
  const addressAsBuffer = cbor.decode(base58.decode(address))[0].value
  const addressData = cbor.decode(addressAsBuffer)
  const attributes = addressData[1]
  const payload = cbor.decode(attributes.get(1))
  const derivationPath = decryptDerivationPath(payload, hdPassphrase)

  if (derivationPath.length > 2) {
    throw Error('Invalid derivation path length, should be at most 2')
  }

  return {
    derivationPath,
  }
}

module.exports = {
  packAddress,
  unpackAddress,
  isValidAddress,
}
