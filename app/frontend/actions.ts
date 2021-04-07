import {saveAs} from './libs/file-saver'
import {withdrawalPlanValidator, mnemonicValidator} from './helpers/validators'
import debugLog from './helpers/debugLog'
import NamedError from './helpers/NamedError'
import {exportWalletSecretDef} from './wallet/keypass-json'
import sanitizeMnemonic from './helpers/sanitizeMnemonic'
import {State, getSourceAccountInfo, Store} from './state'
import {
  Lovelace,
  CryptoProviderFeature,
  TxType,
  AuthMethodType,
  DeregisterStakingKeyTransactionSummary,
} from './types'
import {parseCliUnsignedTx} from './wallet/shelley/helpers/stakepoolRegistrationUtils'
import errorActions from './actions/error'
import loadingActions from './actions/loading'
import walletActions, {getWallet} from './actions/wallet'
import transactionActions from './actions/transaction'
import sendActions from './actions/send'
import delegateActions from './actions/delegate'
import accountsActions from './actions/accounts'
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
    resetDelegation,
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
    resetTransactionSummary,
    resetSendFormState,
    resetSendFormFields,
    setTransactionSummary,
    prepareTxPlan,
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

  /* POOL OWNER */

  const loadPoolCertificateTx = async (state: State, fileContentStr: string) => {
    try {
      loadingAction(state, 'Loading pool registration certificate...')
      setState({poolRegTxError: undefined})
      const {txBodyType, unsignedTxParsed, ttl, validityIntervalStart} = parseCliUnsignedTx(
        fileContentStr
      )
      const txPlan = await getWallet()
        .getAccount(state.activeAccountIndex)
        .getPoolRegistrationTxPlan({txType: TxType.POOL_REG_OWNER, unsignedTxParsed})
      setState({
        poolRegTransactionSummary: {
          shouldShowPoolCertSignModal: false,
          ttl,
          validityIntervalStart,
          witness: null,
          plan: txPlan,
          txBodyType,
        },
      })
    } catch (err) {
      debugLog(`Certificate file parsing failure: ${err}`)
      setError(state, {
        errorName: 'poolRegTxError',
        error: {name: 'PoolRegTxParserError', message: err.message},
      })
    } finally {
      stopLoadingAction(state)
    }
  }

  const openPoolRegTransactionModal = (state: State) => {
    setState({
      poolRegTransactionSummary: {
        ...state.poolRegTransactionSummary,
        shouldShowPoolCertSignModal: true,
      },
    })
  }

  const closePoolRegTransactionModal = (state: State) => {
    setState({
      poolRegTransactionSummary: {
        ...state.poolRegTransactionSummary,
        shouldShowPoolCertSignModal: false,
      },
    })
  }

  const resetPoolRegTransactionSummary = (state: State) => {
    setState({
      poolRegTransactionSummary: {
        shouldShowPoolCertSignModal: false,
        ttl: null,
        validityIntervalStart: null,
        witness: null,
        plan: null,
        txBodyType: null,
      },
      poolRegTxError: null,
    })
  }

  const signPoolCertificateTx = async (state: State) => {
    try {
      // TODO: refactor feature support logic
      const supportError = getWallet().ensureFeatureIsSupported(CryptoProviderFeature.POOL_OWNER)
      if (supportError) throw NamedError(supportError.code, {message: supportError.params.message})
      if (state.usingHwWallet) {
        setState({waitingForHwWallet: true})
        loadingAction(state, `Waiting for ${state.hwWalletName}...`)
      } else {
        throw NamedError('PoolRegNoHwWallet')
      }

      const {plan, ttl, validityIntervalStart} = state.poolRegTransactionSummary

      const txAux = await getWallet()
        .getAccount(state.sourceAccountIndex)
        .prepareTxAux(plan, ttl, validityIntervalStart)
      const witness = await getWallet()
        .getAccount(state.sourceAccountIndex)
        .witnessPoolRegTxAux(txAux)

      setState({
        poolRegTransactionSummary: {
          ...state.poolRegTransactionSummary,
          shouldShowPoolCertSignModal: false,
          witness,
        },
      })
    } catch (e) {
      debugLog(`Certificate transaction file signing failure: ${e}`)
      resetPoolRegTransactionSummary(state)
      setError(state, {errorName: 'poolRegTxError', error: e})
    } finally {
      stopLoadingAction(state)
    }
  }

  const deregisterStakingKey = async (state: State): Promise<void> => {
    const supportError = getWallet().ensureFeatureIsSupported(CryptoProviderFeature.WITHDRAWAL)
    if (supportError) {
      setError(state, {
        errorName: 'transactionSubmissionError',
        error: supportError,
      })
      setState({shouldShowTransactionErrorModal: true})
      return
    }

    state = getState()
    const sourceAccount = getSourceAccountInfo(state)
    const rewards = getSourceAccountInfo(state).shelleyBalances.rewardsAccountBalance as Lovelace
    const balance = getSourceAccountInfo(state).balance as Lovelace

    loadingAction(state, 'Preparing transaction...')

    const txPlanResult = await prepareTxPlan({
      txType: TxType.DEREGISTER_STAKE_KEY,
      rewards,
      stakingAddress: sourceAccount.stakingAddress,
    })
    if (txPlanResult.success === true) {
      const summary = {
        type: TxType.DEREGISTER_STAKE_KEY,
        deposit: txPlanResult.txPlan.deposit,
        rewards,
      } as DeregisterStakingKeyTransactionSummary

      setTransactionSummary(txPlanResult.txPlan, summary)
      await confirmTransaction(getState(), 'deregisterStakeKey')
    } else {
      // Handled the same way as for withdrawal
      const withdrawalValidationError =
        withdrawalPlanValidator(rewards, balance, txPlanResult.estimatedFee) ||
        getWallet().ensureFeatureIsSupported(CryptoProviderFeature.WITHDRAWAL) ||
        txPlanResult.error
      setError(state, {
        errorName: 'transactionSubmissionError',
        error: withdrawalValidationError,
      })
      setState({shouldShowTransactionErrorModal: true})
    }
    stopLoadingAction(state)
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
