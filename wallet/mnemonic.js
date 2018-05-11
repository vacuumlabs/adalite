const bip39 = require('bip39')
const cbor = require('cbor')
const crypto = require('crypto')
const {eddsa: EdDsa} = require('elliptic-cardano')
const ec = new EdDsa('ed25519')

const hashBlake2b256 = require('./helpers/hashBlake2b256')
const {words} = require('./valid-words.en')
const transaction = require('./transaction')

function generateMnemonic() {
  return bip39.generateMnemonic(null, null, words)
}

function validateMnemonic(mnemonic) {
  try {
    return !!mnemonic && bip39.validateMnemonic(mnemonic)
  } catch (e) {
    return false
  }
}

function mnemonicToHdNode(mnemonic) {
  const hashSeed = mnemonicToHashSeed(mnemonic)
  let result

  for (let i = 1; result === undefined && i <= 1000; i++) {
    const hmac = crypto.createHmac('sha512', hashSeed)
    hmac.update(`Root Seed Chain ${i}`)

    const digest = hmac.digest('hex')

    const secret = new Buffer(digest.substr(0, 64), 'hex')

    try {
      const secretKey = extendSecretToSecretKey(secret)
      const publicKey = new Buffer(ec.keyFromSecret(secret.toString('hex')).getPublic('hex'), 'hex')

      const chainCode = new Buffer(digest.substr(64, 64), 'hex')

      result = new transaction.HdNode(
        Buffer.concat([secretKey, publicKey, chainCode]).toString('hex')
      )
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

function extendSecretToSecretKey(secret) {
  const sha512 = crypto.createHash('sha512')

  sha512.update(secret)

  const hashResult = new Buffer(sha512.digest('hex'), 'hex')

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

  const ent = new Buffer(bip39.mnemonicToEntropy(mnemonic), 'hex')

  return cbor.encode(hashBlake2b256(ent))
}

module.exports = {
  generateMnemonic,
  mnemonicToHdNode,
  validateMnemonic,
}
