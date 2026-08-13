import {
  decodePaperWalletMnemonic,
  mnemonicToRootKeypair,
  _seedToKeypairV1 as seedToKeypairV1,
} from 'cardano-crypto.js'
import {mnemonicToSeed} from '@scure/bip39'
import {HDKey} from '@scure/bip32'
import {DerivationScheme, TwelveWordDerivationMode, WalletSecretDef} from '../../types'

import {validateMnemonic, isMnemonicInPaperWalletFormat} from '../mnemonic'
import assertUnreachable from '../../helpers/assertUnreachable'

import derivationSchemes from './derivation-schemes'

const EXODUS_DERIVATION_PATH = "m/44'/1815'/0'/0/0"

const TWELVE_WORD_DERIVATION_SCHEMES: Record<TwelveWordDerivationMode, DerivationScheme> = {
  legacy: derivationSchemes.v1,
  icarus: derivationSchemes.v2,
  exodus: derivationSchemes.exodus,
}

const getExodusRootSecretFromSeed = (seed: Buffer): Buffer => {
  const wallet = HDKey.fromMasterSeed(new Uint8Array(seed)).derive(EXODUS_DERIVATION_PATH)
  const privateKey = wallet.privateKey
  if (!privateKey) {
    throw new Error('Failed to derive Exodus private key')
  }
  return seedToKeypairV1(Buffer.from(privateKey))
}

const walletSecretDefFromMnemonicAndScheme = async (
  mnemonic: string,
  derivationScheme: DerivationScheme
): Promise<WalletSecretDef> => ({
  rootSecret: await mnemonicToRootKeypair(mnemonic, derivationScheme.ed25519Mode),
  derivationScheme,
})

const walletSecretDefFromTwelveWordMnemonic = async (
  mnemonic: string,
  twelveWordDerivation: TwelveWordDerivationMode
): Promise<WalletSecretDef> => {
  const derivationScheme = TWELVE_WORD_DERIVATION_SCHEMES[twelveWordDerivation]

  switch (twelveWordDerivation) {
    case 'legacy':
    case 'icarus':
      return await walletSecretDefFromMnemonicAndScheme(mnemonic, derivationScheme)
    case 'exodus': {
      const seed = Buffer.from(await mnemonicToSeed(mnemonic))
      return {
        rootSecret: getExodusRootSecretFromSeed(seed),
        derivationScheme,
        exodusBip39Seed: seed,
      }
    }
    default:
      return assertUnreachable(twelveWordDerivation)
  }
}

const mnemonicToWalletSecretDef = async (
  mnemonic: string,
  {
    twelveWordDerivation = 'legacy',
  }: {twelveWordDerivation?: TwelveWordDerivationMode} = {}
): Promise<WalletSecretDef> => {
  if (!validateMnemonic(mnemonic)) {
    throw new Error('Invalid mnemonic format')
  }
  if (await isMnemonicInPaperWalletFormat(mnemonic)) {
    mnemonic = await decodePaperWalletMnemonic(mnemonic)
  }

  const wordCount = mnemonic.split(' ').length
  if (wordCount === 12) {
    return await walletSecretDefFromTwelveWordMnemonic(mnemonic, twelveWordDerivation)
  }

  // 15/24/27-word phrases use Icarus (Shelley v2) derivation.
  return await walletSecretDefFromMnemonicAndScheme(mnemonic, derivationSchemes.v2)
}

export default mnemonicToWalletSecretDef
