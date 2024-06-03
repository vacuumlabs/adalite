import assertUnreachable from '../../helpers/assertUnreachable'
import {CryptoProviderType, HwWalletCryptoProviderType, WalletName} from '../types'

export function getDeviceBrandName(providerType: HwWalletCryptoProviderType): WalletName {
  if (isHwWallet(providerType)) {
    return getWalletName(providerType)
  }

  return assertUnreachable(providerType)
}

export function getWalletName(providerType: CryptoProviderType): WalletName {
  switch (providerType) {
    case CryptoProviderType.BITBOX02:
      return WalletName.BITBOX02
    case CryptoProviderType.LEDGER:
      return WalletName.LEDGER
    case CryptoProviderType.TREZOR:
      return WalletName.TREZOR
    case CryptoProviderType.WALLET_SECRET:
      return WalletName.MNEMONIC
    default:
      return assertUnreachable(providerType)
  }
}

export function isHwWallet(
  providerType: CryptoProviderType | undefined | null
): providerType is HwWalletCryptoProviderType {
  if (providerType == null) {
    return false
  }

  return [
    CryptoProviderType.BITBOX02,
    CryptoProviderType.LEDGER,
    CryptoProviderType.TREZOR,
  ].includes(providerType)
}
