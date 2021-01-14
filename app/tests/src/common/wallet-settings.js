import cryptoProviderSettings from './crypto-provider-settings'

export const walletSettings = [
  {
    description: 'Shelley 15 word',
    ...cryptoProviderSettings[4],
  },
  {
    description: 'Byron 12 word',
    ...cryptoProviderSettings[5],
  },
  {
    description: 'Shelley 15 word not used',
    ...cryptoProviderSettings[6],
  },
]
