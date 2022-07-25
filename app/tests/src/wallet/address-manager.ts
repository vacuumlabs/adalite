import * as assert from 'assert'

import derivationSchemes from '../../../frontend/wallet/helpers/derivation-schemes'
import AddressManager from '../../../frontend/wallet/address-manager'
import mnemonicToWalletSecretDef from '../../../frontend/wallet/helpers/mnemonicToWalletSecretDef'
import {addressManagerSettings} from '../common/address-manager-settings'
import BlockchainExplorer from '../../../frontend/wallet/blockchain-explorer'
import ShelleyJsCryptoProvider from '../../../frontend/wallet/shelley/shelley-js-crypto-provider'
import {ShelleyBaseAddressProvider} from '../../../frontend/wallet/shelley/shelley-address-provider'

const mockConfig = {
  ADALITE_BLOCKCHAIN_EXPLORER_URL: 'https://explorer.adalite.io',
  ADALITE_SERVER_URL: 'http://localhost:3000',
  ADALITE_DEFAULT_ADDRESS_COUNT: 10,
  ADALITE_GAP_LIMIT: 10,
}

const blockchainExplorer = BlockchainExplorer(mockConfig)
const addressManagers = {}

const initAddressManager = async (settings) => {
  const {
    accountIndex,
    isChange,
    type,
    network,
    shouldExportPubKeyBulk,
    secret,
    derivationSchemeType,
  } = settings

  let walletSecretDef
  if (type === 'walletSecretDef') {
    walletSecretDef = {
      rootSecret: Buffer.from(secret, 'hex'),
      derivationScheme: derivationSchemes[derivationSchemeType],
    }
  } else {
    walletSecretDef = await mnemonicToWalletSecretDef(secret)
  }

  const cryptoProvider = await ShelleyJsCryptoProvider({
    walletSecretDef,
    network,
    config: {shouldExportPubKeyBulk},
  })

  const addressProvider = ShelleyBaseAddressProvider(cryptoProvider, accountIndex, isChange)

  return AddressManager({
    addressProvider,
    gapLimit: mockConfig.ADALITE_GAP_LIMIT,
    blockchainExplorer,
  })
}

before(async () => {
  await Promise.all(
    Object.entries(addressManagerSettings).map(async ([name, setting]) => {
      addressManagers[name] = await initAddressManager(setting)
    })
  )
})

describe('Address derivation shelley', () => {
  Object.entries(addressManagerSettings).forEach(([name, setting]) =>
    it(`should derive the right sequence of addresses with ${name}`, async () => {
      const addressManager = addressManagers[name]
      const expectedAddresses = setting.addresses
      const walletAddresses = await addressManager._deriveAddresses(0, 20)
      assert.equal(JSON.stringify(walletAddresses), JSON.stringify(expectedAddresses))
    })
  )
})
