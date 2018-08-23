const {decodePaperWalletMnemonic, walletSecretFromMnemonic} = require('cardano-crypto.js')

const {isMnemonicInPaperWalletFormat} = require('../mnemonic')
const {validateMnemonic} = require('../mnemonic')
const {DERIVATION_SCHEMES} = require('../constants')

const guessDerivationSchemeFromMnemonic = (mnemonic) => {
  return mnemonic.split(' ').length === 12 ? DERIVATION_SCHEMES.v1 : DERIVATION_SCHEMES.v2
}

const mnemonicToWalletSecret = async (mnemonic, derivationScheme) => {
  if (await isMnemonicInPaperWalletFormat(mnemonic)) {
    mnemonic = await decodePaperWalletMnemonic(mnemonic)
  }

  return walletSecretFromMnemonic(mnemonic, derivationScheme.number)
}

const mnemonicOrHdNodeStringToWalletSecret = async (
  mnemonicOrHdNodeString,
  preferredDerivationScheme = undefined
) => {
  let walletSecret
  let derivationScheme
  if (validateMnemonic(mnemonicOrHdNodeString)) {
    const mnemonic = mnemonicOrHdNodeString
    derivationScheme =
      preferredDerivationScheme || guessDerivationSchemeFromMnemonic(mnemonicOrHdNodeString)
    walletSecret = await mnemonicToWalletSecret(mnemonic, derivationScheme)
  } else {
    walletSecret = Buffer.from(mnemonicOrHdNodeString, 'hex')
    derivationScheme = preferredDerivationScheme || DERIVATION_SCHEMES.v1
  }

  return {
    walletSecret,
    derivationScheme,
  }
}

module.exports = mnemonicOrHdNodeStringToWalletSecret
