const bip39 = require('bip39')
const cbor = require('cbor')
const crypto = require('crypto')
const {eddsa: EdDsa} = require('elliptic-cardano')
const ec = new EdDsa('ed25519')

const hashBlake2b256 = require('./helpers/hashBlake2b256')
const {validateMnemonic} = require('./mnemonic')

function HdNode({secretKey, publicKey, chainCode}) {
  /**
   * HD node groups secretKey, publicKey and chainCode
   * can be initialized from Buffers or single string
   * @param secretKey as Buffer
   * @param publicKey as Buffer
   * @param chainCode as Buffer
   */

  const extendedPublicKey = Buffer.concat([publicKey, chainCode], 64)

  function toString() {
    return Buffer.concat([secretKey, extendedPublicKey]).toString('hex')
  }

  return {
    secretKey,
    publicKey,
    chainCode,
    extendedPublicKey,
    toString,
  }
}

function mnemonicToHdNode(mnemonic) {
  const hashSeed = mnemonicToHashSeed(mnemonic)
  let result

  for (let i = 1; result === undefined && i <= 1000; i++) {
    const hmac = crypto.createHmac('sha512', hashSeed)
    hmac.update(`Root Seed Chain ${i}`)

    const digest = hmac.digest('hex')

    const secret = Buffer.from(digest.substr(0, 64), 'hex')

    try {
      const secretKey = extendSecretToSecretKey(secret)
      const publicKey = Buffer.from(
        ec.keyFromSecret(secret.toString('hex')).getPublic('hex'),
        'hex'
      )

      const chainCode = Buffer.from(digest.substr(64, 64), 'hex')

      result = HdNode({secretKey, publicKey, chainCode})
    } catch (e) {
      if (e.name === 'InvalidArgumentException') {
        continue
      }

      throw e
    }
  }

  if (result === undefined) {
    const e = new Error('Secret key generation from mnemonic is looping forever')
    e.name = 'RuntimeException'
    throw e
  }

  return result
}

function hdNodeStringToHdNode(hdNodeString) {
  return HdNode({
    secretKey: Buffer.from(hdNodeString.substr(0, 128), 'hex'),
    publicKey: Buffer.from(hdNodeString.substr(128, 64), 'hex'),
    chainCode: Buffer.from(hdNodeString.substr(192, 64), 'hex'),
  })
}

function extendSecretToSecretKey(secret) {
  const sha512 = crypto.createHash('sha512')

  sha512.update(secret)

  const hashResult = Buffer.from(sha512.digest('hex'), 'hex')

  hashResult[0] &= 248
  hashResult[31] &= 127
  hashResult[31] |= 64

  if (hashResult[31] & 0x20) {
    const e = new Error('Invalid secret')
    e.name = 'InvalidArgumentException'
    throw e
  }

  return hashResult
}

function mnemonicToHashSeed(mnemonic) {
  if (!validateMnemonic(mnemonic)) {
    const e = new Error('Invalid or unsupported mnemonic format')
    e.name = 'InvalidArgumentException'
    throw e
  }

  const ent = Buffer.from(bip39.mnemonicToEntropy(mnemonic), 'hex')

  return cbor.encode(hashBlake2b256(cbor.encode(ent)))
}

module.exports = {
  HdNode,
  mnemonicToHdNode,
  hdNodeStringToHdNode,
}
