import {accountSettings} from './account-settings'
import {cryptoProviderSettings} from './crypto-provider-settings'

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

// const addressManagerSettings = [
//   {
//     accountIndex: 0,
//     isChange: true,
//     cryptoSettings: cryptoProviderSettings[4],
//     shouldExportPubKeyBulk: true,
//   },
//   {
//     accountIndex: 0,
//     isChange: false,
//     cryptoSettings: cryptoProviderSettings[4],
//     shouldExportPubKeyBulk: true,
//   },
//   {
//     accountIndex: 1,
//     isChange: true,
//     cryptoSettings: cryptoProviderSettings[4],
//     shouldExportPubKeyBulk: true,
//   },
//   {
//     accountIndex: 1,
//     isChange: false,
//     cryptoSettings: cryptoProviderSettings[4],
//     shouldExportPubKeyBulk: true,
//   },
// ]

const addressManagerSettings = {
  changeAddressProviderForAccount0: {
    ...accountSettings.ShelleyAccount0,
    isChange: true,
    addresses: accountSettings.ShelleyAccount0.internalAddresses,
  },
  nonChangeAddressProviderForAccount0: {
    ...accountSettings.ShelleyAccount0,
    isChange: false,
    addresses: accountSettings.ShelleyAccount0.externalAddresses,
  },
  changeAddressProviderForAccount1: {
    ...accountSettings.ShelleyAccount1,
    isChange: true,
    addresses: accountSettings.ShelleyAccount1.internalAddresses,
  },
  nonChangeAddressProviderForAccount1: {
    ...accountSettings.ShelleyAccount1,
    isChange: false,
    addresses: accountSettings.ShelleyAccount1.externalAddresses,
  },
}

export {byronAddressManagerSettings, addressManagerSettings, addressManagerSettings2}
