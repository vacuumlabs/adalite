const bip39 = require('bip39')
const exceptions = require('node-exceptions')
const cbor = require('cbor')
const bigNumber = require('bignumber.js')
const crypto = require('crypto')
const EdDSAOriginal = require('elliptic-cardano').eddsa
const ecOriginal = new EdDSAOriginal('ed25519')

const hashBlake2b256 = require('./utils').hashBlake2b256
const validWords = require('./assets/valid-words.en').words
const transaction = require('./transaction')

exports.generateMnemonic = function() {
  return bip39.generateMnemonic(null, null, validWords)
}

exports.mnemonicToWalletSecretString = function(mnemonic) {
  const hashSeed = mnemonicToHashSeed(mnemonic)
  let result

  for (let i = 1; result === undefined && i <= 1000; i++) {
    const hmac = crypto.createHmac('sha512', hashSeed)
    hmac.update(`Root Seed Chain ${i}`)

    const digest = hmac.digest('hex')

    const secret = new Buffer(digest.substr(0, 64), 'hex')

    try {
      const secretKey = extendSecretToSecretKey(secret)
      const publicKey = new Buffer(
        ecOriginal.keyFromSecret(secret.toString('hex')).getPublic('hex'),
        'hex'
      )

      const chainCode = new Buffer(digest.substr(64, 64), 'hex')

      result = new transaction.WalletSecretString(
        Buffer.concat([secretKey, publicKey, chainCode]).toString('hex')
      )
    } catch (e) {
      if (e instanceof exceptions.InvalidArgumentException) {
        continue
      }

      throw e
    }
  }

  if (result === undefined) {
    throw exceptions.RuntimeException('Secret key generation from mnemonic is looping forever')
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
    throw new exceptions.InvalidArgumentException('Invalid secret')
  }

  return hashResult
}

function mnemonicToHashSeed(mnemonic) {
  if (!bip39.validateMnemonic(mnemonic)) {
    throw new exceptions.InvalidArgumentException('Mnemonic with invalid checksum')
  }

  const mnemonicAsHex = mnemonicToIndices(mnemonic)
    .reduce((acc, elem) => {
      return acc.multipliedBy('800', 16).plus(bigNumber(elem.toString(10)))
    }, bigNumber('0'))
    .toString(16)

  const result = new Buffer(
    cbor.encode(new Buffer(hashBlake2b256(new Buffer(mnemonicAsHex, 'hex')), 'hex')),
    'hex'
  )

  return result
}

function mnemonicToIndices(mnemonic) {
  return mnemonic.split(' ').map(mnemonicWordToIndex)
}

function mnemonicWordToIndex(word) {
  const result = validWords.indexOf(word)

  if (result === -1) {
    throw new exceptions.InvalidArgumentException(`Not a valid mnemonic word: ${word}`)
  }

  return result
}
