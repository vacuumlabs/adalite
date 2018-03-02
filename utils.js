const blake2 = require('blakejs')
const cbor = require('cbor')
require('isomorphic-fetch')
const exceptions = require('node-exceptions')
const EdDSA = require('elliptic-cardano').eddsaVariant
const ec = new EdDSA('ed25519')
const ed25519 = require('supercop.js')
const bigNumber = require('bignumber.js')
const sha3_256 = require('js-sha3').sha3_256
const padStart = require('string.prototype.padstart')
padStart.shim()

exports.hashBlake2b256 = function(input) {
  const context = blake2.blake2bInit(32)
  blake2.blake2bUpdate(context, new Buffer(cbor.encode(input), 'hex'))

  result = new Buffer(blake2.blake2bFinal(context))

  return result.toString('hex')
}

exports.addressHash = function(input) {
  const serializedInput = cbor.encode(input)

  const firstHash = new Buffer(sha3_256(serializedInput), 'hex')

  const context = blake2.blake2bInit(28) // blake2b-224
  blake2.blake2bUpdate(context, firstHash)

  result = new Buffer(blake2.blake2bFinal(context))

  return result.toString('hex')
}

exports.hex2buf = function(hexString) {
  return Buffer.from(hexString, 'hex')
}

exports.sign = function(message, extendedPrivateKey) {
  const privKey = extendedPrivateKey.getSecretKey() //extendedPrivateKey.substr(0, 128);
  const pubKey = extendedPrivateKey.getPublicKey() //substr(128, 64);

  const messageToSign = new Buffer(message, 'hex')

  return ed25519
    .sign(messageToSign, new Buffer(pubKey, 'hex'), new Buffer(privKey, 'hex'))
    .toString('hex')
}

exports.verify = function(message, publicKey, signature) {
  const key = ec.keyFromPublic(publicKey, 'hex')

  return key.verify(message, signature)
}

exports.add256NoCarry = function(b1, b2) {
  let result = ''

  for (let i = 0; i < 32; i++) {
    result += ((b1[i] + b2[i]) & 0xff).toString(16).padStart(2, '0')
  }

  return new Buffer(result, 'hex')
}

function toLittleEndian(str) {
  // from https://stackoverflow.com/questions/7946094/swap-endianness-javascript
  s = str.replace(/^(.(..)*)$/, '0$1') // add a leading zero if needed
  const a = s.match(/../g) // split number in groups of two
  a.reverse() // reverse the goups
  return a.join('') // join the groups back together
}

exports.scalarAdd256ModM = function(b1, b2) {
  let resultAsHexString = bigNumber(toLittleEndian(b1.toString('hex')), 16)
    .plus(bigNumber(toLittleEndian(b2.toString('hex')), 16))
    .mod(bigNumber('1000000000000000000000000000000014def9dea2f79cd65812631a5cf5d3ed', 16))
    .toString(16)
  resultAsHexString = toLittleEndian(resultAsHexString).padEnd(64, '0')

  return new Buffer(resultAsHexString, 'hex')
}

exports.multiply8 = function(buf) {
  let result = ''
  let prevAcc = 0

  for (let i = 0; i < buf.length; i++) {
    result += ((((buf[i] * 8) & 0xff) + (prevAcc & 0x8)) & 0xff).toString(16).padStart(2, '0')
    prevAcc = buf[i] * 32
  }

  return new Buffer(result, 'hex')
}

exports.request = async function(url, method = 'GET', body = {}, headers = {}) {
  const res = await fetch(url, {
    method,
    headers,
    body,
  })
  if (res.status >= 400) {
    throw new Error(res.status)
  }

  return res.json()
}
