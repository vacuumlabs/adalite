const blake2 = require('blakejs')
const cbor = require('cbor')

module.exports = function hashBlake2b256(input) {
  const context = blake2.blake2bInit(32)
  blake2.blake2bUpdate(context, new Buffer(cbor.encode(input), 'hex'))

  return new Buffer(blake2.blake2bFinal(context)).toString('hex')
}
