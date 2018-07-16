const CardanoCrypto = require('cardano-crypto.js')

const {isMnemonicInPaperWalletFormat, decodePaperWalletMnemonic} = require('../mnemonic')

const parseMnemonicOrHdNodeString = async (mnemonicOrHdNodeString) => {
  const isMnemonic = mnemonicOrHdNodeString.search(' ') >= 0

  if (isMnemonic) {
    let mnemonic
    if (await isMnemonicInPaperWalletFormat(mnemonicOrHdNodeString)) {
      mnemonic = await decodePaperWalletMnemonic(mnemonicOrHdNodeString)
    } else {
      mnemonic = mnemonicOrHdNodeString
    }
    return CardanoCrypto.walletSecretFromMnemonic(mnemonic)
  } else {
    return Buffer.from(mnemonicOrHdNodeString, 'hex')
  }
}

module.exports = parseMnemonicOrHdNodeString
