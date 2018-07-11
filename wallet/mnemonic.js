const bip39 = require('bip39')

const {pbkdf2Sync} = require('./helpers/pbkdf2')
const {words} = require('./valid-words.en')

function generateMnemonic() {
  return bip39.generateMnemonic(null, null, words)
}

function validateMnemonic(mnemonic) {
  try {
    return !!mnemonic && (bip39.validateMnemonic(mnemonic) || isPaperWalletMnemonic(mnemonic))
  } catch (e) {
    return false
  }
}

function isPaperWalletMnemonic(mnemonic) {
  return mnemonicToList(mnemonic).length === 27
}

function mnemonicToList(mnemonic) {
  return mnemonic.split(' ')
}

function mnemonicToPaperWalletPassphrase(mnemonic, password) {
  const mnemonicBuffer = Buffer.from(mnemonic, 'utf8')
  const salt = `mnemonic${password || ''}`
  const saltBuffer = Buffer.from(salt, 'utf8')
  return pbkdf2Sync(mnemonicBuffer, saltBuffer, 2048, 32, 'sha512').toString('hex')
}

function decodePaperWalletMnemonic(paperWalletMnemonic) {
  const paperWalletMnemonicAsList = mnemonicToList(paperWalletMnemonic)

  if (paperWalletMnemonicAsList.length !== 27) {
    throw Error(
      `Paper Wallet Mnemonic must be 27 words, got ${paperWalletMnemonicAsList.length} instead`
    )
  }

  const mnemonicScrambledPart = paperWalletMnemonicAsList.slice(0, 18).join(' ')
  const mnemonicPassphrasePart = paperWalletMnemonicAsList.slice(18, 27).join(' ')

  const passphrase = mnemonicToPaperWalletPassphrase(mnemonicPassphrasePart)
  const unscrambledMnemonic = unscrambleStrings(passphrase, mnemonicScrambledPart)

  return unscrambledMnemonic
}

// eslint-disable-next-line max-len
/* taken from https://github.com/input-output-hk/rust-cardano/blob/08796d9f100f417ff30549b297bd20b249f87809/cardano/src/paperwallet.rs */
function unscrambleStrings(passphrase, mnemonic) {
  const input = Buffer.from(bip39.mnemonicToEntropy(mnemonic), 'hex')
  const saltLength = 8

  if (saltLength >= input.length) {
    throw Error('unscrambleStrings: Input is too short')
  }

  const outputLength = input.length - saltLength

  const output = pbkdf2Sync(passphrase, input.slice(0, saltLength), 10000, outputLength, 'sha512')

  for (let i = 0; i < outputLength; i++) {
    output[i] = output[i] ^ input[saltLength + i]
  }

  return bip39.entropyToMnemonic(output)
}

module.exports = {
  generateMnemonic,
  validateMnemonic,
  isPaperWalletMnemonic,
  decodePaperWalletMnemonic,
  _decodePaperWalletMnemonic: decodePaperWalletMnemonic,
}
