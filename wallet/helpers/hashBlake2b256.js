const blake2 = require('blakejs')
const cbor = require('cbor')

module.exports = function hashBlake2b256(input) {
  return Buffer.from(blake2.blake2b(cbor.encode(input), null, 32))
}
