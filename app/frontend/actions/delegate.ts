import {Store, State, getSourceAccountInfo} from '../state'
import {withdrawalPlanValidator, delegationPlanValidator} from '../helpers/validators'
import {getWallet} from './wallet'
import errorActions from './error'
import loadingActions from './loading'
import commonActions from './common'
import transactionActions from './transaction'
import {
  DelegateTransactionSummary,
  CryptoProviderFeature,
  Lovelace,
  TxType,
  DeregisterStakingKeyTransactionSummary,
} from '../types'
import debounceEvent from '../helpers/debounceEvent'
import * as assert from 'assert'
import BigNumber from 'bignumber.js'

export default (store: Store) => {
  const {setState, getState} = store
  const {setError} = errorActions(store)
  const {loadingAction, stopLoadingAction} = loadingActions(store)
  const {prepareTxPlan, setTransactionSummary} = commonActions(store)
  const {confirmTransaction} = transactionActions(store)

  const hasPoolIdentifiersChanged = (state: State) => {
    const {shelleyDelegation: newShelleyDelegation} = getState()
    return (
      newShelleyDelegation?.selectedPool?.poolHash !==
      state.shelleyDelegation?.selectedPool?.poolHash
    )
    // maybe also check if tab changed
  }

  const setPoolInfo = async (state: State) => {
    if (hasPoolIdentifiersChanged(state)) {
      return
    }
    const selectedPool = state.shelleyDelegation?.selectedPool
    const poolInfo =
      !selectedPool?.name && selectedPool?.url
        ? await getWallet().getPoolInfo(selectedPool?.url)
        : null
    if (hasPoolIdentifiersChanged(state)) {
      return
    }
    const newState = getState()
    setState({
      shelleyDelegation: {
        ...state.shelleyDelegation,
        selectedPool: selectedPool
          ? {
            ...selectedPool,
            ...poolInfo,
          }
          : null,
        delegationFee: newState.shelleyDelegation?.delegationFee,
      },
      gettingPoolInfo: false,
    })
  }

  /*
  REFACTOR: (calculateFee)
  Same issues as with "calculateFee" applies.
  */
  const calculateDelegationFee = async (): Promise<void> => {
    const state = getState()
    // selectedPool may be null e.g. when switching tab and selectedPool
    // is already reset when this debounced function is executed
    if (state.shelleyDelegation?.selectedPool == null) {
      return
    }
    await setPoolInfo(state)
    const poolHash = state.shelleyDelegation.selectedPool.poolHash as string
    const {
      shelleyAccountInfo: {hasStakingKey: isStakingKeyRegistered, hasVoteDelegation},
      stakingAddress,
    } = getSourceAccountInfo(state)
    const txPlanResult = prepareTxPlan({
      poolHash,
      stakingAddress,
      isStakingKeyRegistered,
      txType: TxType.DELEGATE,
      hasVoteDelegation,
    })
    const newState = getState()
    if (hasPoolIdentifiersChanged(newState)) {
      return
    }
    const balance = getSourceAccountInfo(state).balance as Lovelace

    if (txPlanResult.success === true) {
      setState({
        shelleyDelegation: {
          ...newState.shelleyDelegation,
          delegationFee: txPlanResult.txPlan.fee.plus(txPlanResult.txPlan.deposit) as Lovelace,
        },
      })
      assert(newState.shelleyDelegation?.selectedPool != null)
      const delegationTransactionSummary: DelegateTransactionSummary = {
        type: TxType.DELEGATE,
        deposit: txPlanResult.txPlan.deposit,
        stakePool: newState.shelleyDelegation.selectedPool,
      }
      setTransactionSummary(getState(), {
        plan: txPlanResult.txPlan,
        transactionSummary: delegationTransactionSummary,
      })
      setState({
        calculatingDelegationFee: false,
        txSuccessTab: newState.txSuccessTab === 'send' ? newState.txSuccessTab : '',
      })
      setError(state, {
        errorName: 'delegationValidationError',
        error: null,
      })
    } else {
      // REFACTOR: (Untyped errors)
      const validationError =
        delegationPlanValidator(balance, txPlanResult.deposit, txPlanResult.estimatedFee) ||
        txPlanResult.error
      setError(state, {
        errorName: 'delegationValidationError',
        error: validationError,
      })
      setState({calculatingDelegationFee: false})
    }
  }

  const debouncedCalculateDelegationFee = debounceEvent(calculateDelegationFee, 500)

  const updateStakePoolIdentifier = (state: State, poolHash: string): void => {
    assert(state.validStakepoolDataProvider != null)
    const newPool =
      (poolHash && state.validStakepoolDataProvider.getPoolInfoByPoolHash(poolHash)) || null
    setState({
      shelleyDelegation: {
        ...state.shelleyDelegation,
        selectedPool: newPool,
      },
      calculatingDelegationFee: true,
      gettingPoolInfo: true,
    })
    debouncedCalculateDelegationFee(state)
  }

  const resetDelegation = () => {
    setState({
      shelleyDelegation: {
        delegationFee: new BigNumber(0) as Lovelace,
        selectedPool: null,
      },
    })
  }

  const resetStakePoolIndentifier = (): void => {
    resetDelegation()
    setState({
      delegationValidationError: null,
    })
  }

  const delegate = async (state: State): Promise<void> => {
    const delegationTxPlan = state.cachedTransactionSummaries[TxType.DELEGATE]?.plan
    assert(delegationTxPlan != null)
    return await confirmTransaction(state, {
      txConfirmType: TxType.DELEGATE,
      txPlan: delegationTxPlan,
      sourceAccountIndex: state.sourceAccountIndex,
    })
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
    const {
      accountIndex,
      balance,
      stakingAddress,
      shelleyAccountInfo: {hasVoteDelegation},
      shelleyBalances: {rewardsAccountBalance: rewards},
    } = getSourceAccountInfo(state)

    loadingAction(state, 'Preparing transaction...')
    const txPlanResult = prepareTxPlan({
      txType: TxType.DEREGISTER_STAKE_KEY,
      rewards,
      stakingAddress,
      hasVoteDelegation,
    })
    if (txPlanResult.success === true) {
      const summary = {
        type: TxType.DEREGISTER_STAKE_KEY,
        deposit: txPlanResult.txPlan.deposit,
        rewards,
      } as DeregisterStakingKeyTransactionSummary

      setTransactionSummary(getState(), {plan: txPlanResult.txPlan, transactionSummary: summary})
      await confirmTransaction(getState(), {
        sourceAccountIndex: accountIndex,
        txPlan: txPlanResult.txPlan,
        txConfirmType: TxType.DEREGISTER_STAKE_KEY,
      })
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
    delegate,
    calculateDelegationFee,
    resetDelegation,
    updateStakePoolIdentifier,
    resetStakePoolIndentifier,
    deregisterStakingKey,
  }
}
