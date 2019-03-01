const {decodePaperWalletMnemonic, mnemonicToRootKeypair} = require('cardano-crypto.js')

const {isMnemonicInPaperWalletFormat} = require('../mnemonic')
const {validateMnemonic} = require('../mnemonic')
const derivationSchemes = require('../derivation-schemes')

const guessDerivationSchemeFromMnemonic = (mnemonic) => {
  return mnemonic.split(' ').length === 12 ? derivationSchemes.v1 : derivationSchemes.v2
}

const mnemonicToWalletSecretDef = async (mnemonic) => {
  if (!validateMnemonic(mnemonic)) {
    throw Error('Invalid mnemonic format')
  }
  if (await isMnemonicInPaperWalletFormat(mnemonic)) {
    mnemonic = await decodePaperWalletMnemonic(mnemonic)
  }

  const derivationScheme = guessDerivationSchemeFromMnemonic(mnemonic)
  const rootSecret = await mnemonicToRootKeypair(mnemonic, derivationScheme.number)

  return {
    rootSecret,
    derivationScheme,
  }
}

module.exports = mnemonicToWalletSecretDef
