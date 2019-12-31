import { initialState } from '../store'
import {State, Ada, Lovelace} from '../state'
import TestnetWallet from './testnet-wallet'
import sleep from '../helpers/sleep'
import testnetBalances from '../components/pages/delegations/testnetBalances'

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

  const loadWallet = async(state, {cryptoProviderType, walletSecretDef}) => {
    wallet = await TestnetWallet(
      {walletSecretDef}
    )
    const accountInfo = await wallet.getAccountStatus(walletSecretDef.rootSecret.pubkeyHex)
    const delegationHistory = await wallet.getDelegationHistory()
    const validStakepools = await wallet.getValidStakePools()
    const displayStakingPage = true
    setState({
      validStakepools,
      walletIsLoaded: true,
      testnetBalances: accountInfo.testnetBalances,
      testnetDelegation: {
        ...state.testnetDelegation,
        counter: accountInfo.counter
      },
      currentDelegation: accountInfo.currentDelegation,
      delegationHistory,
      displayStakingPage,
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
  const fetchPoolInfo = (poolId) => {
    return poolId === 'adalite-stake-pool-id'
      && {
        name: 'AdaLite Stake Pool',
      }
  }

  // DUMMY
  const calculateDelegationFee = () => {
    setState({
      delegationFee: 0,
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
      !state.testnetDelegation.selectedPools.every((pool) => pool.valid && pool.percent) ||
      calculateDelegatedPercent(state.testnetDelegation.selectedPools) !== 100

    setState({
      delegationValidationError,
    })
    if (!delegationValidationError) {
      setState({ calculatingDelegationFee: true })
      debouncedCalculateDelegationFee()
    } else {
      setState({ delegationFee: 0 })
    }
  }

  const updateStakePoolId = (state, e) => {
    const poolId = e.target.value
    const selectedPools = state.testnetDelegation.selectedPools
    setState({
      testnetDelegation: {
        ...state.testnetDelegation,
        selectedPools: selectedPools.map((pool, i) => {
          const index = parseInt(e.target.name, 10) 
          return i === index
            ? {
              ...pool,
              id: e.target.value,
              valid: state.validStakepools.has(poolId),
              ...fetchPoolInfo(poolId),
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
    const selectedPools = state.testnetDelegation.selectedPools
    const delegatedPercent = calculateDelegatedPercent(selectedPools)
    const newPercent = parseInt(e.target.value ? e.target.value : 0, 10) 
    if (delegatedPercent + newPercent > 100) {
      return
    }
    setState({
      testnetDelegation: {
        ...state.testnetDelegation,
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
    const selectedPools = state.testnetDelegation.selectedPools
    setState({
      testnetDelegation: {
        ...state.testnetDelegation,
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
    const selectedPools = state.testnetDelegation.selectedPools
    setState({
      testnetDelegation: {
        ...state.testnetDelegation,
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