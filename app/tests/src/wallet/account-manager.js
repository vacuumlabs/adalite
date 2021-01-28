import {AccountManager} from '../../../frontend/wallet/account-manager'
import {accountManagerSettings} from '../common/account-manager-settings'
import {ADALITE_CONFIG} from '../../../frontend/config'

import assert from 'assert'

import derivationSchemes from '../../../frontend/wallet/helpers/derivation-schemes'

import mnemonicToWalletSecretDef from '../../../frontend/wallet/helpers/mnemonicToWalletSecretDef'

import BlockchainExplorer from '../../../frontend/wallet/blockchain-explorer'

import ShelleyJsCryptoProvider from '../../../frontend/wallet/shelley/shelley-js-crypto-provider'
import mockNetwork from '../common/mock'

const accountManagers = []

const initAccountManager = async (settings, i) => {
  const {
    type,
    derivationSchemeType,
    secret,
    network,
    shouldExportPubKeyBulk,
    isShelleyCompatible,
    maxAccountIndex,
  } = settings
  const config = {...ADALITE_CONFIG, isShelleyCompatible, shouldExportPubKeyBulk}
  // console.log(JSON.stringify(settings))
  const blockchainExplorer = BlockchainExplorer(ADALITE_CONFIG, {})

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
    config,
  })

  accountManagers.push(
    AccountManager({config, cryptoProvider, blockchainExplorer, maxAccountIndex})
  )
}

before(async () => {
  for (const accountManagerSetting of accountManagerSettings) {
    await initAccountManager(accountManagerSetting)
  }
})

describe('account discovery', () => {
  // TODO: refactor to foreach
  it('should discover the right amount of accounts', async () => {
    const mockNet = mockNetwork(ADALITE_CONFIG)
    mockNet.mockBulkAddressSummaryEndpoint()
    const accounts = await accountManagers[0].discoverAccounts()
    // console.log(accounts, accountManagerSettings[0])
    assert.equal(accounts.length, accountManagerSettings[0].numberOfDiscoveredAccounts)
    mockNet.clean()
  })
  it('should not discover accounts if bulk export is disabled', async () => {
    const mockNet = mockNetwork(ADALITE_CONFIG)
    mockNet.mockBulkAddressSummaryEndpoint()
    const accounts = await accountManagers[1].discoverAccounts()
    // console.log(accounts, accountManagerSettings[1])
    assert.equal(accounts.length, accountManagerSettings[1].numberOfDiscoveredAccounts)
    mockNet.clean()
  })
  it('should not discover accounts if wallet is not shelley compatible', async () => {
    const mockNet = mockNetwork(ADALITE_CONFIG)
    mockNet.mockBulkAddressSummaryEndpoint()
    const accounts = await accountManagers[2].discoverAccounts()
    assert.equal(accounts.length, accountManagerSettings[2].numberOfDiscoveredAccounts)
    mockNet.clean()
  })
  it('should discover one account if no accounts were used', async () => {
    const mockNet = mockNetwork(ADALITE_CONFIG)
    mockNet.mockBulkAddressSummaryEndpoint()
    const accounts = await accountManagers[3].discoverAccounts()
    assert.equal(accounts.length, accountManagerSettings[3].numberOfDiscoveredAccounts)
    mockNet.clean()
  })
})

describe('account exploration', () => {
  it('should not add account if previous wasnt used', async () => {
    const mockNet = mockNetwork(ADALITE_CONFIG)
    mockNet.mockBulkAddressSummaryEndpoint()
    const accountsLength = (await accountManagers[0].discoverAccounts()).length
    // TODO: fix issue with assert.rejects
    try {
      await accountManagers[0].exploreNextAccount()
      assert.fail()
    } catch (e) {
      const newAccountsLength = (await accountManagers[0].discoverAccounts()).length
      assert.equal(accountsLength, newAccountsLength)
    } finally {
      mockNet.clean()
    }
  })
  it('should add consequent new account if previous was used', async () => {
    const mockNet = mockNetwork(ADALITE_CONFIG)
    mockNet.mockBulkAddressSummaryEndpoint()
    const accountsLength = (await accountManagers[1].discoverAccounts()).length
    const nextAccount = await accountManagers[1].exploreNextAccount()
    assert.equal(accountsLength, nextAccount.accountIndex)
    mockNet.clean()
  })
})
