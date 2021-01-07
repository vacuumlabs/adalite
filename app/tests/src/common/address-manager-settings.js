import {accountSettings} from './account-settings'
import cryptoProviderSettings from './crypto-provider-settings'

const byronAddressManagerSettings = [
  {
    isChange: false,
    cryptoSettings: cryptoProviderSettings[0],
  },
  {
    isChange: false,
    cryptoSettings: cryptoProviderSettings[1],
  },
  {
    isChange: false,
    cryptoSettings: cryptoProviderSettings[2],
  },
  {
    isChange: false,
    cryptoSettings: cryptoProviderSettings[3],
  },
  {
    isChange: true,
    cryptoSettings: cryptoProviderSettings[3],
  },
]

const addressManagerSettings = [
  {
    accountIndex: 0,
    isChange: true,
    cryptoSettings: cryptoProviderSettings[4],
    shouldExportPubKeyBulk: true,
  },
  {
    accountIndex: 0,
    isChange: false,
    cryptoSettings: cryptoProviderSettings[4],
    shouldExportPubKeyBulk: true,
  },
  {
    accountIndex: 1,
    isChange: true,
    cryptoSettings: cryptoProviderSettings[4],
    shouldExportPubKeyBulk: true,
  },
  {
    accountIndex: 1,
    isChange: false,
    cryptoSettings: cryptoProviderSettings[4],
    shouldExportPubKeyBulk: true,
  },
]

const addressManagerSettings2 = [
  {
    isChange: true,
    ...accountSettings[0],
  },
  {
    isChange: false,
    ...accountSettings[0],
  },
  {
    isChange: true,
    ...accountSettings[0],
  },
  {
    isChange: false,
    ...accountSettings[0],
  },
]

export {byronAddressManagerSettings, addressManagerSettings, addressManagerSettings2}
