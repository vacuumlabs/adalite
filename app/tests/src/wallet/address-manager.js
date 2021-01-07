import assert from 'assert'

import derivationSchemes from '../../../frontend/wallet/helpers/derivation-schemes'
import AddressManager from '../../../frontend/wallet/address-manager'
import mnemonicToWalletSecretDef from '../../../frontend/wallet/helpers/mnemonicToWalletSecretDef'
import {addressManagerSettings2 as addressManagerSettings} from '../common/address-manager-settings'
import BlockchainExplorer from '../../../frontend/wallet/blockchain-explorer'
import ShelleyJsCryptoProvider from '../../../frontend/wallet/shelley/shelley-js-crypto-provider'
import {ShelleyBaseAddressProvider} from '../../../frontend/wallet/shelley/shelley-address-provider'

const mockConfig = {
  ADALITE_BLOCKCHAIN_EXPLORER_URL: 'https://explorer.adalite.io',
  ADALITE_SERVER_URL: 'http://localhost:3000',
  ADALITE_DEFAULT_ADDRESS_COUNT: 10,
  ADALITE_GAP_LIMIT: 10,
}

const blockchainExplorer = BlockchainExplorer(mockConfig, {})
const addressManagers = []

const initAddressManager = async (settings, i) => {
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

  const cryptoProvider = ShelleyJsCryptoProvider({
    walletSecretDef,
    network,
    config: {shouldExportPubKeyBulk},
  })

  const addressProvider = ShelleyBaseAddressProvider(cryptoProvider, accountIndex, isChange)

  addressManagers[i] = AddressManager({
    addressProvider,
    gapLimit: mockConfig.ADALITE_GAP_LIMIT,
    blockchainExplorer,
  })
}

before(async () => {
  await Promise.all(addressManagerSettings.map(initAddressManager))
})

describe('shelley wallet addresses derivation scheme V2', () => {
  it('should derive the right sequence of change addresses from the root secret key', async () => {
    const expectedAddresses = addressManagerSettings[0].internalAddresses
    const walletAddresses = await addressManagers[0]._deriveAddresses(0, 20)
    assert.equal(JSON.stringify(walletAddresses), JSON.stringify(expectedAddresses))
  })

  it('should derive the right sequence of addresses from the root secret key', async () => {
    const expectedAddresses = addressManagerSettings[1].externalAddresses
    const walletAddresses = await addressManagers[1]._deriveAddresses(0, 20)
    assert.equal(JSON.stringify(walletAddresses), JSON.stringify(expectedAddresses))
  })

  it('should derive the right sequence of change addresses from Account 1', async () => {
    const expectedAddresses = addressManagerSettings[2].internalAddresses
    const walletAddresses = await addressManagers[2]._deriveAddresses(0, 20)
    assert.equal(JSON.stringify(walletAddresses), JSON.stringify(expectedAddresses))
  })

  it('should derive the right sequence of addresses from Account 1', async () => {
    const expectedAddresses = addressManagerSettings[3].externalAddresses
    const walletAddresses = await addressManagers[3]._deriveAddresses(0, 20)
    assert.equal(JSON.stringify(walletAddresses), JSON.stringify(expectedAddresses))
  })
})
