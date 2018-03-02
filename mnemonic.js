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

  for (let i = 1; i <= 1001; i++) {
    const hmac = crypto.createHmac('sha512', hashSeed)
    hmac.update(`Root Seed Chain ${i}`)

    const digest = hmac.digest('hex')

    const secret = new Buffer(digest.substr(0, 64), 'hex')

    try {
      var secretKey = extendSecretToSecretKey(secret)
      var publicKey = new Buffer(
        ecOriginal.keyFromSecret(secret.toString('hex')).getPublic('hex'),
        'hex'
      )

      var chainCode = new Buffer(digest.substr(64, 64), 'hex')
    } catch (e) {
      if (i > 1000) {
        throw exceptions.RuntimeException('Secret key generation from mnemonic is looping forever')
      }
      continue
    }

    return new transaction.WalletSecretString(
      Buffer.concat([secretKey, publicKey, chainCode]).toString('hex')
    )
  }
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

  var result = mnemonicToIndices(mnemonic)
    .reduce((acc, elem) => {
      return acc.multipliedBy('800', 16).plus(bigNumber(elem.toString(10)))
    }, bigNumber('0'))
    .toString(16)
  result = result.length % 2 != 0 ? result.substr(0, result.length - 1) : result
  var result = new Buffer(
    cbor.encode(new Buffer(hashBlake2b256(new Buffer(result, 'hex')), 'hex')),
    'hex'
  )

  return result
}

function mnemonicToIndices(mnemonic) {
  return mnemonic.split(' ').map(mnemonicWordToIndex)
}

function mnemonicWordToIndex(word) {
  const result = validWords.indexOf(word)

  if (result == -1) {
    throw new exceptions.InvalidArgumentException(`Not a valid mnemonic word: ${word}`)
  }

  return result
}
