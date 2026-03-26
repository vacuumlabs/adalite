import {
  decodePaperWalletMnemonic,
  mnemonicToRootKeypair,
  _seedToKeypairV1 as seedToKeypairV1,
} from 'cardano-crypto.js'
import * as bip39 from 'bip39'
import {HDKey} from '@scure/bip32'
import {WalletSecretDef} from '../../types'

import {validateMnemonic, isMnemonicInPaperWalletFormat} from '../mnemonic'

import derivationSchemes from './derivation-schemes'

const guessDerivationSchemeFromMnemonic = (mnemonic) => {
  return mnemonic.split(' ').length === 12 ? derivationSchemes.v1 : derivationSchemes.v2
}

const EXODUS_DERIVATION_PATH = "m/44'/1815'/0'/0/0"

const getExodusRootSecretFromSeed = (seed: Buffer): Buffer => {
  const wallet = HDKey.fromMasterSeed(new Uint8Array(seed)).derive(EXODUS_DERIVATION_PATH)
  const privateKey = wallet.privateKey
  if (!privateKey) {
    throw new Error('Failed to derive Exodus private key')
  }
  return seedToKeypairV1(Buffer.from(privateKey))
}

const mnemonicToWalletSecretDef = async (
  mnemonic,
  {useExodusDerivationPath = false}: {useExodusDerivationPath?: boolean} = {}
): Promise<WalletSecretDef> => {
  if (!validateMnemonic(mnemonic)) {
    throw new Error('Invalid mnemonic format')
  }
  if (await isMnemonicInPaperWalletFormat(mnemonic)) {
    mnemonic = await decodePaperWalletMnemonic(mnemonic)
  }

  if (useExodusDerivationPath) {
    const seed = bip39.mnemonicToSeedSync(mnemonic)
    return {
      rootSecret: getExodusRootSecretFromSeed(seed),
      derivationScheme: derivationSchemes.exodus,
      exodusBip39Seed: seed,
    }
  }

  const derivationScheme = guessDerivationSchemeFromMnemonic(mnemonic)
  const rootSecret = await mnemonicToRootKeypair(mnemonic, derivationScheme.ed25519Mode)

  return {
    rootSecret,
    derivationScheme,
  }
}

export default mnemonicToWalletSecretDef
