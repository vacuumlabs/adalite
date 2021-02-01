import {shelleyCryptoProviderSettings} from './crypto-provider-settings'

export const walletSettings = {
  Shelley15Word: {
    ...shelleyCryptoProviderSettings.mnemonic15Word,
  },
  Byron12Word: {
    ...shelleyCryptoProviderSettings.mnemonic12Word,
  },
  Shelley15WordUnused: {
    ...shelleyCryptoProviderSettings.mnemonic15WordUnused,
  },
}
