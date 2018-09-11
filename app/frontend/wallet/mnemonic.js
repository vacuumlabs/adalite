const bip39 = require('bip39-light')

function generateMnemonic(wordCount) {
  wordCount = wordCount || 12

  if (wordCount % 3 !== 0) {
    throw Error(`Invalid mnemonic word count supplied: ${wordCount}`)
  }

  return bip39.generateMnemonic((32 * wordCount) / 3)
}

function validateMnemonic(mnemonic) {
  try {
    return (
      !!mnemonic && (bip39.validateMnemonic(mnemonic) || isMnemonicInPaperWalletFormat(mnemonic))
    )
  } catch (e) {
    return false
  }
}

function validateMnemonicWords(mnemonic) {
  const wordlist = bip39.wordlists.EN
  const words = mnemonic.split(' ')

  return words.reduce((result, word) => {
    return result && wordlist.indexOf(word) !== -1
  }, true)
}

function validatePaperWalletMnemonic(mnemonic) {
  return !!mnemonic && validateMnemonicWords(mnemonic) && isMnemonicInPaperWalletFormat(mnemonic)
}

function isMnemonicInPaperWalletFormat(mnemonic) {
  return mnemonicToList(mnemonic).length === 27
}

function mnemonicToList(mnemonic) {
  return mnemonic.split(' ')
}

module.exports = {
  generateMnemonic,
  validateMnemonic,
  validatePaperWalletMnemonic,
  isMnemonicInPaperWalletFormat,
}
