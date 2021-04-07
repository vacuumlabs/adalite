import {saveAs} from './libs/file-saver'
import {mnemonicValidator} from './helpers/validators'
import {exportWalletSecretDef} from './wallet/keypass-json'
import sanitizeMnemonic from './helpers/sanitizeMnemonic'
import {State, Store} from './state'
import {AuthMethodType} from './types'
import errorActions from './actions/error'
import loadingActions from './actions/loading'
import walletActions, {getWallet} from './actions/wallet'
import transactionActions from './actions/transaction'
import sendActions from './actions/send'
import delegateActions from './actions/delegate'
import accountsActions from './actions/accounts'
import poolOwnerActions from './actions/poolOwner'
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
  const {
    loadPoolCertificateTx,
    openPoolRegTransactionModal,
    closePoolRegTransactionModal,
    signPoolCertificateTx,
    resetPoolRegTransactionSummary,
    deregisterStakingKey,
  } = poolOwnerActions(store)
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
  } = generalActions(store)
  const {setState, getState} = store

  const setAuthMethod = (state: State, authMethod: AuthMethodType): void => {
    setState({authMethod})
  }

  const closeDemoWalletWarningDialog = (state) => {
    setState({
      shouldShowDemoWalletWarningDialog: false,
    })
  }

  const closeNonShelleyCompatibleDialog = (state) => {
    setState({
      shouldShowNonShelleyCompatibleDialog: false,
    })
  }

  const openNonShelleyCompatibleDialog = (state) => {
    setState({
      shouldShowNonShelleyCompatibleDialog: true,
    })
  }

  const closeWalletLoadingErrorModal = (state) => {
    setState({
      shouldShowWalletLoadingErrorModal: false,
    })
  }

  /* MNEMONIC */

  const openGenerateMnemonicDialog = (state) => {
    setState({
      mnemonicAuthForm: {
        mnemonicInputValue: '',
        mnemonicInputError: null,
        formIsValid: false,
      },
      shouldShowGenerateMnemonicDialog: true,
      authMethod: AuthMethodType.MNEMONIC,
      shouldShowMnemonicInfoAlert: true,
    })
  }

  const closeGenerateMnemonicDialog = (state) => {
    setState({
      shouldShowGenerateMnemonicDialog: false,
    })
  }

  const updateMnemonic = (state: State, e) => {
    const mnemonicInputValue = e.target.value
    const sanitizedMnemonic = sanitizeMnemonic(mnemonicInputValue)
    const formIsValid = sanitizedMnemonic && mnemonicValidator(sanitizedMnemonic) === null

    setState({
      ...state,
      mnemonicAuthForm: {
        mnemonicInputValue,
        mnemonicInputError: null,
        formIsValid,
      },
    })
  }

  const updateMnemonicValidationError = (state: State) => {
    setState({
      ...state,
      mnemonicAuthForm: {
        ...state.mnemonicAuthForm,
        mnemonicInputError: mnemonicValidator(
          sanitizeMnemonic(state.mnemonicAuthForm.mnemonicInputValue)
        ),
      },
    })
  }

  /* ADDRESS DETAIL */

  const verifyAddress = async (state: State, address?: string) => {
    const newState = getState()
    if (newState.usingHwWallet) {
      try {
        setState({
          waitingForHwWallet: true,
          addressVerificationError: false,
        })
        await getWallet()
          .getAccount(state.targetAccountIndex)
          .verifyAddress(address || newState.showAddressDetail.address)
        setState({
          waitingForHwWallet: false,
        })
      } catch (e) {
        setState({
          waitingForHwWallet: false,
        })
        setError(state, {errorName: 'addressVerificationError', error: true})
      }
    }
  }

  /* EXPORT WALLET */

  const exportJsonWallet = async (state, password, walletName) => {
    const walletExport = JSON.stringify(
      await exportWalletSecretDef(getWallet().getWalletSecretDef(), password, walletName)
    )

    const blob = new Blob([walletExport], {
      type: 'application/json;charset=utf-8',
    })
    saveAs(blob, `${walletName}.json`)
  }

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
