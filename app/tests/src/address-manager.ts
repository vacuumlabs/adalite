import * as assert from 'assert'

import derivationSchemes from '../../frontend/wallet/helpers/derivation-schemes'
import AddressManager from '../../frontend/wallet/address-manager'
import mnemonicToWalletSecretDef from '../../frontend/wallet/helpers/mnemonicToWalletSecretDef'
import {byronAddressManagerSettings} from './common/address-manager-settings'
import BlockchainExplorer from '../../frontend/wallet/blockchain-explorer'
import ShelleyJsCryptoProvider from '../../frontend/wallet/shelley/shelley-js-crypto-provider'
import mockNetwork from './common/mock'
import {ByronAddressProvider} from '../../frontend/wallet/byron/byron-address-provider'

const mockConfig = {
  ADALITE_BLOCKCHAIN_EXPLORER_URL: 'https://explorer.adalite.io',
  ADALITE_SERVER_URL: 'http://localhost:3000',
  ADALITE_DEFAULT_ADDRESS_COUNT: 10,
  ADALITE_GAP_LIMIT: 10,
}

const blockchainExplorer = BlockchainExplorer(mockConfig)

const byronAddressManagers: ReturnType<typeof AddressManager>[] = []

const initByronAddressManager = async (settings, i) => {
  const {cryptoSettings, isChange} = settings

  let walletSecretDef
  if (cryptoSettings.type === 'walletSecretDef') {
    walletSecretDef = {
      rootSecret: Buffer.from(cryptoSettings.secret, 'hex'),
      derivationScheme: derivationSchemes[cryptoSettings.derivationSchemeType],
    }
  } else {
    walletSecretDef = await mnemonicToWalletSecretDef(cryptoSettings.secret)
  }

  const cryptoProvider = await ShelleyJsCryptoProvider({
    walletSecretDef,
    network: cryptoSettings.network,
    config: {shouldExportPubKeyBulk: true},
  })

  const addressProvider = ByronAddressProvider(cryptoProvider, 0, isChange)

  byronAddressManagers[i] = AddressManager({
    addressProvider,
    gapLimit: mockConfig.ADALITE_GAP_LIMIT,
    blockchainExplorer,
  })
}

before(async () => {
  await Promise.all(byronAddressManagerSettings.map(initByronAddressManager))
})

describe('byron wallet addresses derivation scheme V1', () => {
  const expectedWalletAddresses = [
    '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',
  ]

  it('should derive the right sequence of addresses from the root secret key', async () => {
    const walletAddresses = await byronAddressManagers[2]._deriveAddresses(1, 21)
    assert.equal(JSON.stringify(walletAddresses), JSON.stringify(expectedWalletAddresses))
  })
})

describe('byron wallet addresses derivation scheme V2', () => {
  const expectedWalletAddresses = [
    'Ae2tdPwUPEZ6RUCnjGHFqi59k5WZLiv3HoCCNGCW8SYc5H9srdTzn1bec4W',
    'Ae2tdPwUPEZ7dnds6ZyhQdmgkrDFFPSDh8jG9RAhswcXt1bRauNw5jczjpV',
    'Ae2tdPwUPEZ8LAVy21zj4BF97iWxKCmPv12W6a18zLX3V7rZDFFVgqUBkKw',
    'Ae2tdPwUPEZ7Ed1V5G9oBoRoK3sbgFU8b9iZY2kegf4s6228EwVLRSq9NzP',
    'Ae2tdPwUPEYyLw6UJRKnbbudG8PJR7KfPhioRW8m1BohkFAqR44pPg6BYVZ',
    'Ae2tdPwUPEYw9wMWUnyutGYXdpVqNStf4g3TAxiAYMyACQAWXNFvs3fZ8do',
    'Ae2tdPwUPEZ9wMYpKKXJLAEa5JV2CKBoiFvKfuqdtDLMARkaZG9P4K7ZRjX',
    'Ae2tdPwUPEZHAZxwzS7MrSS8nc6DXt4Nj8FvrYHXCVDkzVEjrAfVxxZEL4H',
    'Ae2tdPwUPEYz8hGBRWCNJFm2bDuSHBbphMT32wPxALXTVPWrRCtZhSPbRen',
    'Ae2tdPwUPEZHxx6ug6oyXREcwQ1tjBY4D2B6M7rYL9LhbAXfRPfMtm3nV4J',
  ]

  it('should derive the right sequence of addresses from the root secret key', async () => {
    const walletAddresses = await byronAddressManagers[3]._deriveAddresses(0, 10)
    assert.equal(JSON.stringify(walletAddresses), JSON.stringify(expectedWalletAddresses))
  })
})

describe('byron wallet addresses discovery scheme V2', () => {
  const expectedWalletAddresses = [
    'Ae2tdPwUPEZ6RUCnjGHFqi59k5WZLiv3HoCCNGCW8SYc5H9srdTzn1bec4W',
    'Ae2tdPwUPEZ7dnds6ZyhQdmgkrDFFPSDh8jG9RAhswcXt1bRauNw5jczjpV',
    'Ae2tdPwUPEZ8LAVy21zj4BF97iWxKCmPv12W6a18zLX3V7rZDFFVgqUBkKw',
    'Ae2tdPwUPEZ7Ed1V5G9oBoRoK3sbgFU8b9iZY2kegf4s6228EwVLRSq9NzP',
    'Ae2tdPwUPEYyLw6UJRKnbbudG8PJR7KfPhioRW8m1BohkFAqR44pPg6BYVZ',
    'Ae2tdPwUPEYw9wMWUnyutGYXdpVqNStf4g3TAxiAYMyACQAWXNFvs3fZ8do',
    'Ae2tdPwUPEZ9wMYpKKXJLAEa5JV2CKBoiFvKfuqdtDLMARkaZG9P4K7ZRjX',
    'Ae2tdPwUPEZHAZxwzS7MrSS8nc6DXt4Nj8FvrYHXCVDkzVEjrAfVxxZEL4H',
    'Ae2tdPwUPEYz8hGBRWCNJFm2bDuSHBbphMT32wPxALXTVPWrRCtZhSPbRen',
    'Ae2tdPwUPEZHxx6ug6oyXREcwQ1tjBY4D2B6M7rYL9LhbAXfRPfMtm3nV4J',
    'Ae2tdPwUPEZMPdF4Z6gPy7Yr3NeXcXbBMZv5saB3pmwsp7HWbRobc1VRZ4X',
    'Ae2tdPwUPEZ7F6a36T3Twgha2KDKHNvPSbYGNQNj4Rh5TeNATPffS7NCLkW',
    'Ae2tdPwUPEYvtUpMc6eGLCo92od8m4utcBHTgYvARfUYY51BUowoQRm2hos',
    'Ae2tdPwUPEZNJGBKu6uB7nT4JYXiM7Gexvr9TaEuUFMwC7ns6JeYH6osQrE',
    'Ae2tdPwUPEZDFJ38Ad8PzQaxN4hoqeMfDmP9qvajLDGZSq7Hi26fZJEVnJ8',
    'Ae2tdPwUPEZBSAotfZ47iZ1QtBCDRGEXfftG75di13axqhaviJvWpT48dm6',
    'Ae2tdPwUPEZFg6vSmeiJKxGxwyJjMgbfVfRirMJBMYHJs2sYfQgX4DW85F8',
    'Ae2tdPwUPEZ7zES3hWiT1RSjVoRwteJWTNMzsjNixtrvR6wMHPPTHroAwnJ',
    'Ae2tdPwUPEZFv14bjnVcXgRLA39FUgjw2hFmRxufNGbxwNx2ivBAZHmeaa5',
    'Ae2tdPwUPEZ6ZMHV9PaJbYqPjNNBUPDksRThhZ5qrqHHU4LXgQ7h9XzYAHC',
  ]

  const expectedWalletChangeAddrs = [
    'Ae2tdPwUPEZ2HcLJSwBAujZSsiuWdz57b2KeiJ6FeqgYEh7omJVpUwccDVe',
    'Ae2tdPwUPEZ4thUT2Rjo6DJiZksAQReYEzhxkP3xq5NFxFJchxDbKL5tbag',
    'Ae2tdPwUPEZFkwwYuqW1HMx2RXV9p8dNuNC1Gdw2aZXA8KXPXsDtobEQ14Q',
    'Ae2tdPwUPEZAFUycTo6T73A5F97Ew5D7gN4NL139rpp86HCU4K6th9DKzeH',
    'Ae2tdPwUPEZ58nzeM5vDihSMYpqCcfWTSJc3jgVyTzt7hvPQ58XU4ZLEfYT',
    'Ae2tdPwUPEZ64DHikwFaJMdQNJBce9tvbABG3X9gCeaNzfF68ckKX2n2L4c',
    'Ae2tdPwUPEZLtvX2byRkHWM2kFHJh3HwvsPefnwhmWw9mJfHuXo7FBMuyxg',
    'Ae2tdPwUPEYz66u2V5S35o7pDxzeYfTJ31ekfzFDGECosSg7TBUMGvs8pC3',
    'Ae2tdPwUPEZ8uLjrq8p6aWNpQTwHrV5RDzdtmbZrW72xj3kAqpsZiuvQ1t4',
    'Ae2tdPwUPEZ3EimSircxs5JoJ9BGbvmhtQX9MV7Lq6hQC3ZBNfShPiS2xHm',
  ]

  it('should discover the right sequence of addresses from the root secret key', async () => {
    const mockNet = mockNetwork(mockConfig)
    mockNet.mockBulkAddressSummaryEndpoint()
    const walletAddresses = await byronAddressManagers[3].discoverAddresses()
    const walletChangeAddresses = await byronAddressManagers[4].discoverAddresses()
    assert.equal(JSON.stringify(walletAddresses), JSON.stringify(expectedWalletAddresses))
    assert.equal(JSON.stringify(walletChangeAddresses), JSON.stringify(expectedWalletChangeAddrs))
    mockNet.clean()
  })
})
