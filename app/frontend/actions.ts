import {Store} from './state'
import errorActions from './actions/error'
import loadingActions from './actions/loading'
import walletActions from './actions/wallet'
import transactionActions from './actions/transaction'
import sendActions from './actions/send'
import delegateActions from './actions/delegate'
import accountsActions from './actions/accounts'
import addressActions from './actions/address'
import poolOwnerActions from './actions/poolOwner'
import exportWalletActions from './actions/exportWallet'
import mnemonicActions from './actions/mnemonic'
import commonActions from './actions/common'
import generalActions from './actions/general'

export default (store: Store) => {
  const {setError} = errorActions(store)
  const {loadingAction, stopLoadingAction} = loadingActions(store)
  const {loadWallet, loadDemoWallet, reloadWalletInfo, logout} = walletActions(store)
  const {
    confirmTransaction,
    cancelTransaction,
    setRawTransactionOpen,
    closeTransactionErrorModal,
    submitTransaction,
  } = transactionActions(store)
  const {
    calculateFee,
    updateAddress,
    updateAmount,
    sendMaxFunds,
    convertNonStakingUtxos,
    withdrawRewards,
  } = sendActions(store)
  const {
    calculateDelegationFee,
    updateStakePoolIdentifier,
    resetStakePoolIndentifier,
  } = delegateActions(store)
  const {
    resetAccountIndexes,
    showSendTransactionModal,
    closeSendTransactionModal,
    showDelegationModal,
    closeDelegationModal,
    setActiveAccount,
    setTargetAccount,
    setSourceAccount,
    exploreNextAccount,
    switchSourceAndTargetAccounts,
  } = accountsActions(store)
  const {verifyAddress} = addressActions(store)
  const {
    loadPoolCertificateTx,
    openPoolRegTransactionModal,
    closePoolRegTransactionModal,
    signPoolCertificateTx,
    resetPoolRegTransactionSummary,
    deregisterStakingKey,
  } = poolOwnerActions(store)
  const {exportJsonWallet} = exportWalletActions(store)
  const {
    updateMnemonic,
    updateMnemonicValidationError,
    openGenerateMnemonicDialog,
    closeGenerateMnemonicDialog,
  } = mnemonicActions(store)
  const {
    resetTransactionSummary,
    resetSendFormState,
    resetSendFormFields,
    setTransactionSummary,
  } = commonActions(store)
  const {
    openWelcome,
    closeWelcome,
    setLogoutNotificationOpen,
    closeUnexpectedErrorModal,
    shouldShowContactFormModal,
    closeContactFormModal,
    closeStakingBanner,
    setActiveMainTab,
    loadErrorBannerContent,
    openInfoModal,
    closeInfoModal,
    closePremiumBanner,
    setAuthMethod,
    closeDemoWalletWarningDialog,
    closeNonShelleyCompatibleDialog,
    openNonShelleyCompatibleDialog,
    closeWalletLoadingErrorModal,
  } = generalActions(store)

  return {
    setError,
    loadingAction,
    stopLoadingAction,
    setAuthMethod,
    loadWallet,
    logout,
    exportJsonWallet,
    reloadWalletInfo,
    openWelcome,
    closeWelcome,
    calculateFee,
    calculateDelegationFee,
    confirmTransaction,
    cancelTransaction,
    submitTransaction,
    updateAddress,
    updateAmount,
    loadDemoWallet,
    updateMnemonic,
    updateMnemonicValidationError,
    verifyAddress,
    setTransactionSummary,
    resetTransactionSummary,
    resetSendFormState,
    resetSendFormFields,
    sendMaxFunds,
    openGenerateMnemonicDialog,
    closeGenerateMnemonicDialog,
    closeDemoWalletWarningDialog,
    closeNonShelleyCompatibleDialog,
    openNonShelleyCompatibleDialog,
    setLogoutNotificationOpen,
    setRawTransactionOpen,
    closeTransactionErrorModal,
    closeWalletLoadingErrorModal,
    closeUnexpectedErrorModal,
    shouldShowContactFormModal,
    closeContactFormModal,
    closeStakingBanner,
    updateStakePoolIdentifier,
    resetStakePoolIndentifier,
    resetAccountIndexes,
    setActiveMainTab,
    convertNonStakingUtxos,
    loadErrorBannerContent,
    withdrawRewards,
    openInfoModal,
    closeInfoModal,
    closePremiumBanner,
    showSendTransactionModal,
    closeSendTransactionModal,
    showDelegationModal,
    closeDelegationModal,
    setActiveAccount,
    setTargetAccount,
    setSourceAccount,
    exploreNextAccount,
    switchSourceAndTargetAccounts,
    loadPoolCertificateTx,
    openPoolRegTransactionModal,
    closePoolRegTransactionModal,
    signPoolCertificateTx,
    resetPoolRegTransactionSummary,
    deregisterStakingKey,
  }
}
