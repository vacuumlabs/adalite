import BlockchainExplorer from './blockchain-explorer'
import {AccountManager} from './account-manager'
import {AccountInfo, CryptoProvider, CryptoProviderFeature} from '../types'
import {MAX_ACCOUNT_INDEX} from './constants'
import {StakepoolDataProvider} from '../helpers/dataProviders/types'

type WalletParams = {
  config: any
  cryptoProvider: CryptoProvider
}

const ShelleyWallet = ({config, cryptoProvider}: WalletParams) => {
  const blockchainExplorer = BlockchainExplorer(config)
  const maxAccountIndex = MAX_ACCOUNT_INDEX

  const accountManager = AccountManager({
    config,
    cryptoProvider,
    blockchainExplorer,
    maxAccountIndex,
  })

  function isHwWallet() {
    return cryptoProvider.isHwWallet()
  }

  function getWalletName() {
    return cryptoProvider.getWalletName()
  }

  function submitTx(signedTx): Promise<any> {
    const params = {
      walletType: getWalletName(),
      walletVersion: cryptoProvider.getVersion(),
      walletDerivationScheme: cryptoProvider.getDerivationScheme().type,
      // TODO: add stake key for debugging purposes
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

  function ensureFeatureIsSupported(feature: CryptoProviderFeature) {
    try {
      // TODO: refactor this so it doesnt throw but return error object
      cryptoProvider.ensureFeatureIsSupported(feature)
    } catch (e) {
      return {code: e.name, params: {message: e.message}}
    }
    return null
  }

  async function getAccountsInfo(
    validStakepoolDataProvider: StakepoolDataProvider
  ): Promise<Array<AccountInfo>> {
    const accounts = await accountManager.discoverAccounts()
    //@ts-ignore TODO: refactor type AccountInfo
    return Promise.all(
      accounts.map((account) => account.getAccountInfo(validStakepoolDataProvider))
    )
  }

  function getMaxAccountIndex() {
    return maxAccountIndex
  }

  function getStakepoolDataProvider(): Promise<StakepoolDataProvider> {
    return blockchainExplorer.getStakepoolDataProvider()
  }

  async function getPoolInfo(url) {
    const poolInfo = await blockchainExplorer.getPoolInfo(url)
    return poolInfo
  }

  return {
    isHwWallet,
    getWalletName,
    submitTx,
    getWalletSecretDef,
    fetchTxInfo,
    ensureFeatureIsSupported,
    getAccountsInfo,
    getStakepoolDataProvider,
    getAccount: accountManager.getAccount,
    exploreNextAccount: accountManager.exploreNextAccount,
    getMaxAccountIndex,
    getPoolInfo,
  }
}

export {ShelleyWallet}
