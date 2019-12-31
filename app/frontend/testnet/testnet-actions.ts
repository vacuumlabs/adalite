import { initialState } from '../store'
import {State, Ada, Lovelace} from '../state'
import TestnetWallet from './testnet-wallet'
import sleep from '../helpers/sleep'
import shelleyBalances from '../components/pages/delegations/shelleyBalances'
import {ADALITE_CONFIG} from '../config'

const debounceEvent = (callback, time) => {
  let interval
  return (...args) => {
    clearTimeout(interval)
    interval = setTimeout(() => {
      interval = null
      callback(...args)
    }, time)
  }
}

type SetStateFn = (newState: Partial<State>) => void
type GetStateFn = () => State

let wallet

export default ({setState, getState}: {setState: SetStateFn; getState: GetStateFn}) => {

  const loadingAction = (state, message: string, optionalArgsObj?: any) => {
    return setState(
      Object.assign(
        {},
        {
          loading: true,
          loadingMessage: message,
        },
        optionalArgsObj
      )
    )
  }

  const stopLoadingAction = (state, optionalArgsObj) => {
    return setState(
      Object.assign(
        {},
        {
          loading: false,
          loadingMessage: undefined,
        },
        optionalArgsObj
      )
    )
  }

  const loadWallet = async(state, {cryptoProviderType, walletSecretDef}) => {
    loadingAction(state, 'Loading wallet data...', {})
    wallet = await TestnetWallet(
      {walletSecretDef}
    )
    const accountInfo = await wallet.getAccountStatus(walletSecretDef.rootSecret.pubkeyHex)
    const delegationHistory = await wallet.getDelegationHistory(
      walletSecretDef.rootSecret.pubkeyHex,
      5,
    )
    const validStakepools = await wallet.getValidStakePools()
    const displayStakingPage = true
    setState({
      loading: false,
      validStakepools,
      walletIsLoaded: true,
      shelleyBalances: accountInfo.shelleyBalances,
      shelleyDelegation: {
        ...state.shelleyDelegation,
        counter: accountInfo.counter
      },
      currentDelegation: accountInfo.currentDelegation,
      delegationHistory,
      displayStakingPage,
    })
    getAdalitePoolInfo()
  }

  const getAdalitePoolInfo = () => {
    const state = getState()
    const poolInfo = getPoolInfo(state, ADALITE_CONFIG.ADALITE_STAKE_POOL_ID)
    setState({
      shelleyDelegation: {
        ...state.shelleyDelegation,
        selectedPools: [
          {
            valid: !!poolInfo,
            ...poolInfo,
          }
        ]
      }
    })
  }

  const submitTransaction = (state) => {
    wallet.submitTransaction()
  }

  const changeDelegation = async (state) => {
    wallet.submitDelegationCert()
  }

  const reloadWalletInfo = () => {
    return null
  }

  const calculateDelegatedPercent = (pools) => {
    return pools.map((pool) => pool.percent).reduce((x, y) => x + y, 0)
  }

  // DUMMY
  const getPoolInfo = (state, poolId) => {
    return state.validStakepools[poolId] 
  }

  // DUMMY
  const calculateDelegationFee = (state) => {
    setState({
      shelleyDelegation: {
        ...state.shelleyDelegation,
        delegationFee: 0,
      }
    })
    setState({
      calculatingDelegationFee: false,
    })
  }

  const debouncedCalculateDelegationFee = debounceEvent(calculateDelegationFee, 2000)

  // DUMMY
  const validateDelegationAndCalculateDelegationFee = () => {
    const state = getState()
    const delegationValidationError =
      !state.shelleyDelegation.selectedPools.every((pool) => pool.valid && pool.percent) ||
      calculateDelegatedPercent(state.shelleyDelegation.selectedPools) !== 100

    setState({
      delegationValidationError,
    })
    if (!delegationValidationError) {
      setState({ calculatingDelegationFee: true })
      debouncedCalculateDelegationFee()
    } else {
      setState({
        shelleyDelegation: {
          ...state.shelleyDelegation,
          delegationFee: 0,
        }
      })
    }
  }

  const updateStakePoolId = (state, e) => {
    const poolId = e.target.value
    const selectedPools = state.shelleyDelegation.selectedPools
    setState({
      shelleyDelegation: {
        ...state.shelleyDelegation,
        selectedPools: selectedPools.map((pool, i) => {
          const index = parseInt(e.target.name, 10) 
          return i === index
            ? {
              ...pool,
              valid: !!state.validStakepools[poolId],
              ...getPoolInfo(state, poolId),
            }
            : pool
        }),
      }
    })
    validateDelegationAndCalculateDelegationFee()
  }
  /*
  
  */

  const updateStakePoolPercent = (state, e) => {
    const index = parseInt(e.target.name, 10)
    const selectedPools = state.shelleyDelegation.selectedPools
    const delegatedPercent = calculateDelegatedPercent(selectedPools)
    const newPercent = parseInt(e.target.value ? e.target.value : 0, 10) 
    // if (delegatedPercent + newPercent > 100) {
    //   return
    // }
    setState({
      shelleyDelegation: {
        ...state.shelleyDelegation,
        selectedPools: selectedPools.map((pool, i) => {
          return i === index 
          ? {
            ...pool,
            percent: newPercent,
          }
          : pool
        }),
      }
    })
    validateDelegationAndCalculateDelegationFee()
  }

  const addStakePool = (state) => {
    const selectedPools = state.shelleyDelegation.selectedPools
    setState({
      shelleyDelegation: {
        ...state.shelleyDelegation,
        selectedPools: [
          ...selectedPools,
          {
            id: '',
            percent: 0,
            name: '',
            valid: false,
          }
        ]
      }
    })
    validateDelegationAndCalculateDelegationFee()
  }

  const removeStakePool = (state, e) => {
    const index = parseInt(e.target.name, 10)
    const selectedPools = state.shelleyDelegation.selectedPools
    setState({
      shelleyDelegation: {
        ...state.shelleyDelegation,
        selectedPools: selectedPools.filter((pool, i) => i !== index),
      }
    })
    validateDelegationAndCalculateDelegationFee()
  }

  const toggleDisplayStakingPage = (state, e) => {
    setState({ displayStakingPage: !state.displayStakingPage })
  }

  return {
    loadWallet,
    updateStakePoolId,
    updateStakePoolPercent,
    addStakePool,
    removeStakePool,
    reloadWalletInfo,
    toggleDisplayStakingPage,
    changeDelegation,
    submitTransaction,
  }
}