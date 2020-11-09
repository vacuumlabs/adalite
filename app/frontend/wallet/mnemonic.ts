import {
  generateMnemonic as _generateMnemonic,
  validateMnemonic as _validateMnemonic,
  wordlists,
} from 'bip39-light'

function generateMnemonic(wordCount) {
  wordCount = wordCount || 12

  if (wordCount % 3 !== 0) {
    throw Error(`Invalid mnemonic word count supplied: ${wordCount}`)
  }

  return _generateMnemonic((32 * wordCount) / 3)
}

function validateMnemonic(mnemonic) {
  try {
    return !!mnemonic && (_validateMnemonic(mnemonic) || validatePaperWalletMnemonic(mnemonic))
  } catch (e) {
    return false
  }
}

function validateMnemonicWords(mnemonic) {
  const wordlist = wordlists.EN
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

function isBip39Word(word) {
  return wordlists.EN.includes(word)
}

export {
  generateMnemonic,
  validateMnemonic,
  validatePaperWalletMnemonic,
  isMnemonicInPaperWalletFormat,
  isBip39Word,
}
