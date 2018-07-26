const cbor = require('cbor')
const {
  chacha20poly1305Encrypt,
  chacha20poly1305Decrypt,
  blake2b,
  sha3_256, // eslint-disable-line camelcase
  crc32,
  base58,
} = require('cardano-crypto.js')

const CborIndefiniteLengthArray = require('./helpers/CborIndefiniteLengthArray')
const NamedError = require('../helpers/NamedError')
const debugLog = require('../helpers/debugLog')

function getAddressHash(input) {
  // eslint-disable-next-line camelcase
  const firstHash = sha3_256(cbor.encode(input))
  return blake2b(firstHash, 28)
}

function encryptDerivationPath(derivationPath, hdPassphrase) {
  const serializedDerivationPath = cbor.encode(new CborIndefiniteLengthArray(derivationPath))

  return chacha20poly1305Encrypt(
    serializedDerivationPath,
    hdPassphrase,
    Buffer.from('serokellfore')
  )
}

function decryptDerivationPath(addressPayload, hdPassphrase) {
  const decipheredDerivationPath = chacha20poly1305Decrypt(
    addressPayload,
    hdPassphrase,
    Buffer.from('serokellfore')
  )

  try {
    return cbor.decode(Buffer.from(decipheredDerivationPath))
  } catch (err) {
    debugLog(err)
    throw NamedError('AddressDecodingException', 'incorrect address or passphrase')
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
    cbor.encode([new cbor.Tagged(24, addressDataEncoded), crc32(addressDataEncoded)])
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
}
