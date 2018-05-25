const blake2 = require('blakejs')

module.exports = function hashBlake2b256(input) {
  return Buffer.from(blake2.blake2b(input, null, 32))
}
