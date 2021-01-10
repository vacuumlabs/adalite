import BlockchainExplorer from './blockchain-explorer'
import {AccountManager} from './account-manager'
import {AccountInfo} from '../types'

const ShelleyWallet = ({config, cryptoProvider}) => {
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

  function checkCryptoProviderVersion(featureName: string) {
    try {
      cryptoProvider.ensureFeatureIsSupported(featureName)
    } catch (e) {
      return {code: e.name, message: e.message}
    }
    return null
  }

  async function getAccountsInfo(validStakepools): Promise<Array<AccountInfo>> {
    const accounts = await accountManager.discoverAccounts()
    return Promise.all(accounts.map((account) => account.getAccountInfo(validStakepools)))
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
    getValidStakepools,
    getAccount: accountManager.getAccount,
    exploreNewAccount: accountManager.exploreNewAccount,
  }
}

export {ShelleyWallet}
