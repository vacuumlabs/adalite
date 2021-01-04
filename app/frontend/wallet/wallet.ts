import BlockchainExplorer from './blockchain-explorer'
import {AccountManager} from './account-manager'

const Wallet = ({config, cryptoProvider}) => {
  const blockchainExplorer = BlockchainExplorer(config)

  const accountManager = AccountManager({config, cryptoProvider, blockchainExplorer})

  function isHwWallet() {
    return cryptoProvider.isHwWallet()
  }

  function getWalletName() {
    return cryptoProvider.getWalletName()
  }

  function submitTx(signedTx): Promise<any> {
    const params = {
      walletType: getWalletName(),
      // TODO: stakeKey
    }
    const {txBody, txHash} = signedTx
    return blockchainExplorer.submitTxRaw(txHash, txBody, params)
  }

  function getWalletSecretDef() {
    return {
      rootSecret: cryptoProvider.getWalletSecret(),
      derivationScheme: cryptoProvider.getDerivationScheme(),
    }
  }

  async function fetchTxInfo(txHash) {
    return await blockchainExplorer.fetchTxInfo(txHash)
  }

  function checkCryptoProviderVersion(type: string) {
    try {
      cryptoProvider.checkVersion(type)
    } catch (e) {
      return {code: e.name, message: e.message}
    }
    return null
  }

  const getWalletInfo = (accountsInfo) => {
    const totalWalletBalance = accountsInfo.reduce(
      (a, {shelleyBalances}) =>
        shelleyBalances.stakingBalance + shelleyBalances.nonStakingBalance + a,
      0
    )
    const totalRewardsBalance = accountsInfo.reduce(
      (a, {shelleyBalances}) => shelleyBalances.rewardsAccountBalance + a,
      0
    )
    const shouldShowSaturatedBanner = accountsInfo.some(
      ({poolRecommendation}) => poolRecommendation.shouldShowSaturatedBanner
    )
    return {
      totalWalletBalance,
      totalRewardsBalance,
      shouldShowSaturatedBanner,
    }
  }

  async function getAccountsInfo(validStakepools) {
    const accounts = await accountManager.discoverAccounts()
    const accountsInfo = await Promise.all(
      accounts.map((account) => account.getAccountInfo(validStakepools))
    )
    return {
      accountsInfo,
    }
  }

  function getValidStakepools(): Promise<any> {
    return blockchainExplorer.getValidStakepools()
  }

  return {
    isHwWallet,
    getWalletName,
    submitTx,
    getWalletSecretDef,
    fetchTxInfo,
    checkCryptoProviderVersion,
    getAccountsInfo,
    getWalletInfo,
    getValidStakepools,
    getAccount: accountManager.getAccount,
    exploreNewAccount: accountManager.exploreNewAccount,
  }
}

export {Wallet}
