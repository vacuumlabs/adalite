import assert from 'assert'
import {AccountManager} from '../../../frontend/wallet/account-manager'
import {accountManagerSettings} from '../common/account-manager-settings'
import {ADALITE_CONFIG} from '../../../frontend/config'
import derivationSchemes from '../../../frontend/wallet/helpers/derivation-schemes'
import mnemonicToWalletSecretDef from '../../../frontend/wallet/helpers/mnemonicToWalletSecretDef'
import BlockchainExplorer from '../../../frontend/wallet/blockchain-explorer'
import ShelleyJsCryptoProvider from '../../../frontend/wallet/shelley/shelley-js-crypto-provider'
import mockNetwork from '../common/mock'

const accountManagers = {}

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

  return AccountManager({config, cryptoProvider, blockchainExplorer, maxAccountIndex})
}

before(async () => {
  await Promise.all(
    Object.entries(accountManagerSettings).map(async ([name, setting]) => {
      accountManagers[name] = await initAccountManager(setting)
    })
  )
})

describe('Account discovery', () => {
  Object.entries(accountManagerSettings).forEach(([name, setting]) =>
    it(`should discover the right amount of accounts ${name}`, async () => {
      const accountManager = accountManagers[name]
      const mockNet = mockNetwork(ADALITE_CONFIG)
      mockNet.mockBulkAddressSummaryEndpoint()
      const accounts = await accountManager.discoverAccounts()
      assert.equal(accounts.length, setting.expectedNumberOfDiscoveredAccounts)
      mockNet.clean()
    })
  )
})

describe('Account exploration', () => {
  it('should not add account if previous wasnt used', async () => {
    const mockNet = mockNetwork(ADALITE_CONFIG)
    mockNet.mockBulkAddressSummaryEndpoint()
    const accountManager = accountManagers.withMultipleUsedAccounts
    const accountsLength = (await accountManager.discoverAccounts()).length
    // TODO: fix issue with assert.rejects
    try {
      await accountManager.exploreNextAccount()
      assert.fail()
    } catch (e) {
      const newAccountsLength = (await accountManager.discoverAccounts()).length
      assert.equal(accountsLength, newAccountsLength)
    } finally {
      mockNet.clean()
    }
  })
  it('should add consequent new account if previous was used', async () => {
    // this concerns the case when the bulk export is disabled
    // as with enabled bulk export all used accounts are discovered at first go
    const mockNet = mockNetwork(ADALITE_CONFIG)
    mockNet.mockBulkAddressSummaryEndpoint()
    const accountManager = accountManagers.withDisabledBulkExport
    const accountsLength = (await accountManager.discoverAccounts()).length
    const nextAccount = await accountManager.exploreNextAccount()
    assert.equal(accountsLength, nextAccount.accountIndex)
    mockNet.clean()
  })
})
