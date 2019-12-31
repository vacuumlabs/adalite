import {decodePaperWalletMnemonic, mnemonicToRootKeypair} from 'cardano-crypto.js'

import {validateMnemonic, isMnemonicInPaperWalletFormat} from '../mnemonic'

import derivationSchemes from './derivation-schemes'

import {buf2hex, bech32_decode} from '../../testnet/libs/bech32'

const privkeyHex = buf2hex(
  bech32_decode(
    'ed25519e_sk1erx07yl7ud3rm9qze5qd6yxfyc5239c2gqas3gsc20sd8nkdadf67dwrqdgjewmytce079hvhwlzawt793lzdhgmm22q7kvje72tqjgpe003k'
  ).data
)

const pubkeyHex = '4543ba6809a6f8365d5c7a51925fdf4a71fa6672ebf6daabdf55b7d1ea3fb668'

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
  const rootSecret = await mnemonicToRootKeypair(mnemonic, derivationScheme.ed25519Mode)

  return {
    rootSecret: {
      privkeyHex,
      pubkeyHex,
    },
    derivationScheme,
  }
}

export default mnemonicToWalletSecretDef
