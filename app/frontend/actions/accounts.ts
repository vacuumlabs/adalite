import {Store, State} from '../state'
import walletActions, {getWallet} from './wallet'
import errorActions from './error'
import sendActions from './send'
import delegateActions from './delegate'
import loadingActions from './loading'
import commonActions from './common'
import {AccountInfo, AssetFamily, Lovelace} from '../types'
import * as assert from 'assert'
import {getChangeAddress} from '../wallet/account'
import BigNumber from 'bignumber.js'

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
      assert(state.validStakepoolDataProvider != null)
      const accountInfo = await nextAccount.getAccountInfo(state.validStakepoolDataProvider)
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

  const setTargetAccount = (state: State, accountIndex: number) => {
    setState({
      targetAccountIndex: accountIndex,
    })
    const targetAddress = getChangeAddress(state.accountsInfo[accountIndex])
    updateAddress(state, null, targetAddress)
  }

  const setSourceAccount = (state: State, accountIndex: number) => {
    resetTransactionSummary(state)
    setState({
      sourceAccountIndex: accountIndex,
    })
    const targetAddress = getChangeAddress(state.accountsInfo[getState().targetAccountIndex])
    updateAddress(state, null, targetAddress)
  }

  const showSendTransactionModal = (
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
      sendAmount: {
        assetFamily: AssetFamily.ADA,
        fieldValue: '',
        coins: new BigNumber(0) as Lovelace,
      }, // TODO: use reset function
      transactionFee: new BigNumber(0) as Lovelace,
    })
    const targetAddress = getChangeAddress(state.accountsInfo[targetAccountIndex])
    updateAddress(getState(), null, targetAddress)
  }

  const closeSendTransactionModal = (state: State) => {
    resetTransactionSummary(state)
    resetAccountIndexes(state)
    setState({
      sendAddress: {fieldValue: ''},
      sendAmount: {
        assetFamily: AssetFamily.ADA,
        fieldValue: '',
        coins: new BigNumber(0) as Lovelace,
      },
      transactionFee: new BigNumber(0) as Lovelace,
      shouldShowSendTransactionModal: false,
      sendAddressValidationError: null,
      sendAmountValidationError: null,
    })
  }

  const switchSourceAndTargetAccounts = (state: State) => {
    const targetAccountIndex = state.sourceAccountIndex
    const sourceAccountIndex = state.targetAccountIndex
    resetTransactionSummary(state)
    setState({
      sourceAccountIndex,
      targetAccountIndex,
    })
    const targetAddress = getChangeAddress(state.accountsInfo[targetAccountIndex])
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
