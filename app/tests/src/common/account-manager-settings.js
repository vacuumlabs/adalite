import {walletSettings} from './wallet-settings'

export const accountManagerSettings = {
  withMultipleUsedAccounts: {
    ...walletSettings.Shelley15Word,
    shouldExportPubKeyBulk: true,
    expectedNumberOfDiscoveredAccounts: 4,
    maxAccountIndex: 30,
  },
  withDisabledBulkExport: {
    ...walletSettings.Shelley15Word,
    shouldExportPubKeyBulk: false,
    expectedNumberOfDiscoveredAccounts: 1,
    maxAccountIndex: 30,
  },
  withShelleyIncompatibleWallet: {
    ...walletSettings.Byron12Word,
    shouldExportPubKeyBulk: true,
    expectedNumberOfDiscoveredAccounts: 1,
    maxAccountIndex: 30,
  },
  withShelleyUnusedWallet: {
    ...walletSettings.Shelley15WordUnused,
    shouldExportPubKeyBulk: true,
    expectedNumberOfDiscoveredAccounts: 1,
    maxAccountIndex: 30,
  },
}
