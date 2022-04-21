import {Account} from './account'
import {CryptoProvider, CryptoProviderFeature} from '../types'
import blockchainExplorer from './blockchain-explorer'
import {UnexpectedError, UnexpectedErrorReason} from '../errors'
import {makeBulkAccountIndexIterator} from './helpers/accountDiscovery'
import {isHwWallet} from '../wallet/helpers/cryptoProviderUtils'
import * as _ from 'lodash'

type AccountManagerParams = {
  config: any
  cryptoProvider: CryptoProvider
  blockchainExplorer: ReturnType<typeof blockchainExplorer>
  maxAccountIndex: number
}

const AccountManager = ({
  config,
  cryptoProvider,
  blockchainExplorer,
  maxAccountIndex,
}: AccountManagerParams) => {
  type Account = ReturnType<typeof Account>
  let accounts: Array<Account> = []

  function getAccount(accountIndex: number) {
    return accounts[accountIndex]
  }

  function discoverAccount(accountIndex: number) {
    return Account({
      config,
      cryptoProvider,
      blockchainExplorer,
      accountIndex,
    })
  }

  async function addNextAccount(account: Account) {
    await account.ensureXpubIsExported() // To ensure user exported pubkey
    const isLastAccountUsed =
      accounts.length > 0 ? await accounts[accounts.length - 1].isAccountUsed() : true
    if (
      account.accountIndex !== accounts.length ||
      !isLastAccountUsed ||
      account.accountIndex > maxAccountIndex
    ) {
      throw new UnexpectedError(UnexpectedErrorReason.AccountExplorationError)
    }

    // HW wallets can't handle paralell requests.
    // Filling the cache allows us to call operations related to addresses in a parallel way later.
    if (isHwWallet(cryptoProvider.getType())) {
      await account.ensureAddressesAreDiscovered()
    }

    accounts = [...accounts, account]
  }

  async function discoverAccounts() {
    const isBulkExportSupported = cryptoProvider.isFeatureSupported(
      CryptoProviderFeature.BULK_EXPORT
    )

    const shouldExploreOnlyOne = !(
      config.shouldExportPubKeyBulk &&
      config.isShelleyCompatible &&
      isBulkExportSupported
    )

    if (
      maxAccountIndex === accounts.length - 1 ||
      (accounts.length > 0 &&
        (shouldExploreOnlyOne || !(await accounts[accounts.length - 1].isAccountUsed())))
    ) {
      return accounts
    }

    if (shouldExploreOnlyOne) {
      await exploreNextAccount()
      return accounts
    }

    for (const [accountIndexStart, accountIndexEnd] of makeBulkAccountIndexIterator()) {
      const _accountIndexStart = Math.max(accountIndexStart, accounts.length)
      const _accountIndexEnd = Math.min(accountIndexEnd, maxAccountIndex)

      if (_accountIndexStart > _accountIndexEnd) {
        continue
      }

      const newAccountBatch = _.range(_accountIndexStart, _accountIndexEnd + 1).map(
        (accountIndex) => accounts[accountIndex] || discoverAccount(accountIndex)
      )

      // Needs to be sequential because HW wallets can't process parallel calls
      // xpubs keys are used in the next step when deciding if accounts are used
      for (const account of newAccountBatch) {
        await account.ensureXpubIsExported()
      }

      const firstUnusedNewAccountIndex = (
        await Promise.all(newAccountBatch.map((newAccount) => newAccount.isAccountUsed()))
      ).findIndex((isUsed) => isUsed === false)

      const foundUnusedAccount = firstUnusedNewAccountIndex !== -1

      const accountsToAdd = newAccountBatch.slice(
        0,
        !foundUnusedAccount ? newAccountBatch.length : firstUnusedNewAccountIndex + 1
      )

      accounts = [...accounts, ...accountsToAdd]
      if (foundUnusedAccount || _accountIndexEnd >= maxAccountIndex) {
        break
      }
    }

    return accounts
  }

  async function exploreNextAccount() {
    const nextAccount = discoverAccount(accounts.length)
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
