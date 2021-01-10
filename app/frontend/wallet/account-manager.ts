import NamedError from '../helpers/NamedError'
import {Account} from './account'
import {CryptoProviderFeatures, MAX_ACCOUNT_COUNT} from './constants'

const AccountManager = ({config, cryptoProvider, blockchainExplorer}) => {
  const accounts: Array<ReturnType<typeof Account>> = []

  function getAccount(accountIndex: number) {
    return accounts[accountIndex]
  }

  function discoverNextAccount() {
    return Account({
      config,
      cryptoProvider,
      blockchainExplorer,
      accountIndex: accounts.length,
    })
  }

  async function addNextAccount(account) {
    await account.init() // To ensure user exported pubkey
    const isLastAccountUsed =
      accounts.length > 0 ? await accounts[accounts.length - 1].isAccountUsed() : true
    if (
      account.accountIndex !== accounts.length ||
      !isLastAccountUsed ||
      account.accountIndex > MAX_ACCOUNT_COUNT
    ) {
      throw NamedError('AccountExplorationError')
    }
    accounts.push(account)
  }

  async function discoverAccounts() {
    // remove rejected promises from pubkey cache
    cryptoProvider.cleanXpubCache()
    const isBulkExportSupported = cryptoProvider.isFeatureSupported(
      CryptoProviderFeatures.BULK_EXPORT
    )
    async function _discoverNextAccount(accountIndex: number) {
      const newAccount = accounts[accountIndex] || discoverNextAccount()
      const isAccountUsed = await newAccount.isAccountUsed()
      if (accountIndex === accounts.length) await addNextAccount(newAccount)
      const shouldExplore = isAccountUsed && config.shouldExportPubKeyBulk && isBulkExportSupported

      return shouldExplore && (await _discoverNextAccount(accountIndex + 1))
    }
    await _discoverNextAccount(Math.max(0, accounts.length - 1))
    return accounts
  }

  async function exploreNextAccount() {
    // remove rejected promises from pubkey cache
    cryptoProvider.cleanXpubCache()
    const nextAccount = discoverNextAccount()
    await addNextAccount(nextAccount)
    return nextAccount
  }

  return {
    getAccount,
    discoverAccounts,
    exploreNextAccount,
  }
}

export {AccountManager}
