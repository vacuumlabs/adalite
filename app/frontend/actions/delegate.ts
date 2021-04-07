import {Store, State, getSourceAccountInfo} from '../state'
import {getWallet} from './wallet'
import errorActions from './error'
import commonActions from './common'
import {DelegateTransactionSummary, Lovelace, TxType} from '../types'
import debounceEvent from '../helpers/debounceEvent'
import {delegationPlanValidator} from '../helpers/validators'

export default (store: Store) => {
  const {setState, getState} = store
  const {setError} = errorActions(store)
  const {prepareTxPlan, setTransactionSummary} = commonActions(store)

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
    const poolInfo = !state.shelleyDelegation?.selectedPool?.name
      ? await getWallet()
        .getAccount(state.sourceAccountIndex)
        .getPoolInfo(state.shelleyDelegation?.selectedPool?.url)
      : {}
    if (hasPoolIdentifiersChanged(state)) {
      return
    }
    const newState = getState()
    setState({
      shelleyDelegation: {
        ...state.shelleyDelegation,
        selectedPool: {
          ...state.shelleyDelegation?.selectedPool,
          ...poolInfo,
        },
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
    setPoolInfo(state)
    const poolHash = state.shelleyDelegation?.selectedPool?.poolHash as string
    const isStakingKeyRegistered = getSourceAccountInfo(state).shelleyAccountInfo.hasStakingKey
    const stakingAddress = getSourceAccountInfo(state).stakingAddress
    const txPlanResult = await prepareTxPlan({
      poolHash,
      stakingAddress,
      isStakingKeyRegistered,
      txType: TxType.DELEGATE,
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
          delegationFee: (txPlanResult.txPlan.fee + txPlanResult.txPlan.deposit) as Lovelace,
        },
      })
      const delegationTransactionSummary: DelegateTransactionSummary = {
        type: TxType.DELEGATE,
        deposit: txPlanResult.txPlan.deposit,
        stakePool: newState.shelleyDelegation?.selectedPool,
      }
      setTransactionSummary(txPlanResult.txPlan, delegationTransactionSummary)
      setState({
        calculatingDelegationFee: false,
        txSuccessTab: newState.txSuccessTab === 'send' ? newState.txSuccessTab : '',
      })
    } else {
      // REFACTOR: (Untyped errors)
      const validationError =
        delegationPlanValidator(balance, 0 as Lovelace, txPlanResult.estimatedFee) ||
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
    const newPool = poolHash && state.validStakepoolDataProvider.getPoolInfoByPoolHash(poolHash)
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
        delegationFee: 0 as Lovelace,
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

  return {
    calculateDelegationFee,
    resetDelegation,
    updateStakePoolIdentifier,
    resetStakePoolIndentifier,
  }
}
