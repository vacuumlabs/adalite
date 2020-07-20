import {decodePaperWalletMnemonic, mnemonicToRootKeypair} from 'cardano-crypto.js'

import {validateMnemonic, isMnemonicInPaperWalletFormat} from '../mnemonic'

import derivationSchemes from './derivation-schemes'
import {ADALITE_CONFIG} from '../../config'

const guessDerivationSchemeFromMnemonic = (mnemonic) => {
  if (ADALITE_CONFIG.ADALITE_CARDANO_VERSION === 'shelley') {
    return derivationSchemes.v2 //TODO: v1 should have been abandoned in shelley (?)
  }
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
  const rootSecret = await mnemonicToRootKeypair(mnemonic, derivationScheme.ed25519Mode)

  return {
    rootSecret,
    derivationScheme,
  }
}

export default mnemonicToWalletSecretDef
