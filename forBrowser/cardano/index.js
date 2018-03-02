import {generateMnemonic, mnemonicToWalletSecretString} from './mnemonic'
import {CardanoWallet as cw} from './cardano-wallet'
import {WalletSecretString as walletSecStr} from './transaction'

export const CardanoWallet = cw
export const Mnemonic = {
  generate: generateMnemonic,
  submit: mnemonicToWalletSecretString,
}
export const WalletSecretString = walletSecStr
