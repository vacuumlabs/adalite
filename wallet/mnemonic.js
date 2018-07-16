const bip39 = require('bip39-light')

const pbkdf2 = require('./helpers/pbkdf2')

function generateMnemonic() {
  return bip39.generateMnemonic(null, null)
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

async function validatePaperWalletMnemonic(mnemonic) {
  if (!!mnemonic && isMnemonicInPaperWalletFormat(mnemonic)) {
    try {
      await decodePaperWalletMnemonic(mnemonic)
      return true
    } catch (e) {
      return false
    }
  }

  return false
}

function isMnemonicInPaperWalletFormat(mnemonic) {
  return mnemonicToList(mnemonic).length === 27
}

function mnemonicToList(mnemonic) {
  return mnemonic.split(' ')
}

async function mnemonicToPaperWalletPassphrase(mnemonic, password) {
  const mnemonicBuffer = Buffer.from(mnemonic, 'utf8')
  const salt = `mnemonic${password || ''}`
  const saltBuffer = Buffer.from(salt, 'utf8')
  return (await pbkdf2(mnemonicBuffer, saltBuffer, 2048, 32, 'sha512')).toString('hex')
}

async function decodePaperWalletMnemonic(paperWalletMnemonic) {
  if (!validateMnemonicWords(paperWalletMnemonic)) {
    throw Error('Invalid paper wallet mnemonic words')
  }

  const paperWalletMnemonicAsList = mnemonicToList(paperWalletMnemonic)

  if (paperWalletMnemonicAsList.length !== 27) {
    throw Error(
      `Paper Wallet Mnemonic must be 27 words, got ${paperWalletMnemonicAsList.length} instead`
    )
  }

  const mnemonicScrambledPart = paperWalletMnemonicAsList.slice(0, 18).join(' ')
  const mnemonicPassphrasePart = paperWalletMnemonicAsList.slice(18, 27).join(' ')

  const passphrase = await mnemonicToPaperWalletPassphrase(mnemonicPassphrasePart)
  const unscrambledMnemonic = await unscrambleStrings(passphrase, mnemonicScrambledPart)

  return unscrambledMnemonic
}

// eslint-disable-next-line max-len
/* taken from https://github.com/input-output-hk/rust-cardano/blob/08796d9f100f417ff30549b297bd20b249f87809/cardano/src/paperwallet.rs */
async function unscrambleStrings(passphrase, mnemonic) {
  const input = Buffer.from(bip39.mnemonicToEntropy(mnemonic), 'hex')
  const saltLength = 8

  if (saltLength >= input.length) {
    throw Error('unscrambleStrings: Input is too short')
  }

  const outputLength = input.length - saltLength

  const output = await pbkdf2(passphrase, input.slice(0, saltLength), 10000, outputLength, 'sha512')

  for (let i = 0; i < outputLength; i++) {
    output[i] = output[i] ^ input[saltLength + i]
  }

  return bip39.entropyToMnemonic(output)
}

module.exports = {
  generateMnemonic,
  validateMnemonic,
  validatePaperWalletMnemonic,
  isMnemonicInPaperWalletFormat,
  decodePaperWalletMnemonic,
}
