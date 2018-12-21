const {decodePaperWalletMnemonic, mnemonicToRootKeypair} = require('cardano-crypto.js')

const {isMnemonicInPaperWalletFormat} = require('../mnemonic')
const {validateMnemonic} = require('../mnemonic')
const derivationSchemes = require('../derivation-schemes')

const guessDerivationSchemeFromMnemonic = (mnemonic) => {
  return mnemonic.split(' ').length === 12 ? derivationSchemes.v1 : derivationSchemes.v2
}

const mnemonicToWalletSecret = async (mnemonic, derivationScheme) => {
  if (await isMnemonicInPaperWalletFormat(mnemonic)) {
    mnemonic = await decodePaperWalletMnemonic(mnemonic)
  }

  return mnemonicToRootKeypair(mnemonic, derivationScheme.number)
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
    derivationScheme = preferredDerivationScheme || derivationSchemes.v1
  }

  return {
    walletSecret,
    derivationScheme,
  }
}

module.exports = mnemonicOrHdNodeStringToWalletSecret
