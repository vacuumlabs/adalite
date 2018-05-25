const bip39 = require('bip39')

const {words} = require('./valid-words.en')

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

module.exports = {
  generateMnemonic,
  validateMnemonic,
}
