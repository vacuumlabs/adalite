import {Store, State} from '../state'
import walletActions, {getWallet} from './wallet'
import errorActions from './error'
import sendActions from './send'
import delegateActions from './delegate'
import loadingActions from './loading'
import commonActions from './common'
import {AccountInfo, AssetFamily, Lovelace} from '../types'

export default (store: Store) => {
  const {setState, getState} = store
  const {setError} = errorActions(store)
  const {loadingAction, stopLoadingAction} = loadingActions(store)
  const {updateAddress} = sendActions(store)
  const {resetDelegation} = delegateActions(store)
  const {getShouldShowSaturatedBanner} = walletActions(store)
  const {resetTransactionSummary, resetAccountIndexes} = commonActions(store)

  const setActiveAccount = (state: State, accountIndex: number) => {
    setState({
      activeAccountIndex: accountIndex,
      targetAccountIndex: accountIndex,
      sourceAccountIndex: accountIndex,
      txSuccessTab: '',
    })
  }

  const exploreNextAccount = async (state: State) => {
    try {
      loadingAction(state, 'Loading account')
      const nextAccount = await getWallet().exploreNextAccount()
      const accountInfo = await nextAccount.loadAccountInfo(state.validStakepoolDataProvider)
      // TODO: remove the type conversion
      const accountsInfo = [...state.accountsInfo, accountInfo] as AccountInfo[]
      // TODO: how about other states? is big delegator etc.
      const shouldShowSaturatedBanner = getShouldShowSaturatedBanner(accountsInfo)
      setState({
        accountsInfo,
        shouldShowSaturatedBanner,
      })
      setActiveAccount(state, nextAccount.accountIndex)
    } catch (e) {
      setError(state, {errorName: 'walletLoadingError', error: e})
      setState({
        shouldShowWalletLoadingErrorModal: true,
      })
    } finally {
      stopLoadingAction(state)
    }
  }

  const setTargetAccount = async (state: State, accountIndex: number) => {
    setState({
      targetAccountIndex: accountIndex,
    })
    const targetAddress = await getWallet()
      .getAccount(accountIndex)
      .getChangeAddress()
    updateAddress(state, null, targetAddress)
  }

  const setSourceAccount = async (state: State, accountIndex: number) => {
    resetTransactionSummary(state)
    setState({
      sourceAccountIndex: accountIndex,
    })
    const targetAddress = await getWallet()
      .getAccount(getState().targetAccountIndex)
      .getChangeAddress()
    updateAddress(state, null, targetAddress)
  }

  const showSendTransactionModal = async (
    state: State,
    sourceAccountIndex: number,
    targetAccountIndex: number
  ) => {
    resetTransactionSummary(state)
    setState({
      sourceAccountIndex,
      targetAccountIndex,
      shouldShowSendTransactionModal: true,
      txSuccessTab: '',
      sendAmount: {assetFamily: AssetFamily.ADA, fieldValue: '', coins: 0 as Lovelace}, // TODO: use reset function
      transactionFee: 0,
    })
    const targetAddress = await getWallet()
      .getAccount(targetAccountIndex)
      .getChangeAddress()
    updateAddress(getState(), null, targetAddress)
  }

  const closeSendTransactionModal = (state: State) => {
    resetTransactionSummary(state)
    resetAccountIndexes(state)
    setState({
      sendAddress: {fieldValue: ''},
      sendAmount: {assetFamily: AssetFamily.ADA, fieldValue: '', coins: 0 as Lovelace},
      transactionFee: 0,
      shouldShowSendTransactionModal: false,
      sendAddressValidationError: null,
      sendAmountValidationError: null,
    })
  }

  const switchSourceAndTargetAccounts = async (state: State) => {
    const targetAccountIndex = state.sourceAccountIndex
    const sourceAccountIndex = state.targetAccountIndex
    resetTransactionSummary(state)
    setState({
      sourceAccountIndex,
      targetAccountIndex,
    })
    const targetAddress = await getWallet()
      .getAccount(targetAccountIndex)
      .getChangeAddress()
    updateAddress(state, null, targetAddress)
  }

  const showDelegationModal = (state: State, sourceAccountIndex: number) => {
    setState({
      sourceAccountIndex,
      shouldShowDelegationModal: true,
      txSuccessTab: '',
    })
  }

  const closeDelegationModal = (state: State) => {
    resetDelegation()
    resetAccountIndexes(state)
    setState({
      shouldShowDelegationModal: false,
    })
  }

  return {
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
  }
}
