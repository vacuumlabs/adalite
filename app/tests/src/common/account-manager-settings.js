import {walletSettings} from './wallet-settings'

export const accountManagerSettings = [
  {
    ...walletSettings[0],
    description: 'with multiple used accounts',
    shouldExportPubKeyBulk: true,
    numberOfDiscoveredAccounts: 4,
  },
  {
    ...walletSettings[0],
    description: 'with disabled bulk export',
    shouldExportPubKeyBulk: false,
    numberOfDiscoveredAccounts: 1,
  },
  {
    ...walletSettings[1],
    description: 'with shelley incompatible wallet',
    shouldExportPubKeyBulk: true,
    numberOfDiscoveredAccounts: 1,
  },
  {
    ...walletSettings[2],
    description: 'with shelley unused wallet',
    shouldExportPubKeyBulk: true,
    numberOfDiscoveredAccounts: 1,
  },
]
