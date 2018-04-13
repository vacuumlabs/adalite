import Cardano from '../wallet/cardano-wallet'
import {CARDANOLITE_CONFIG} from './frontendConfigLoader'

let wallet = null

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

export default ({setState, getState}) => {
  const loadingAction = (state, message, optionalArgsObj) =>
    Object.assign(
      {},
      {
        loading: true,
        loadingMessage: message,
      },
      optionalArgsObj
    )

  const loadWalletFromMnemonic = async (state, mnemonic) => {
    setState(loadingAction(state, 'Loading wallet data...'))

    wallet = Cardano.CardanoWallet(mnemonic, CARDANOLITE_CONFIG)

    const activeWalletId = await wallet.getId()
    const usedAddresses = await wallet.getUsedAddresses()
    const unusedAddresses = [await wallet.getChangeAddress()]
    const transactionHistory = await wallet.getHistory()
    const balance = await wallet.getBalance()
    const sendAmountFieldValue = 0
    const sendAddress = ''
    const sendSuccess = ''
    setState({
      activeWalletId,
      usedAddresses,
      unusedAddresses,
      balance,
      sendAmountFieldValue,
      sendAddress,
      sendSuccess,
      transactionHistory,
      loading: false,
      currentWalletMnemonicOrSecret: '',
    })
  }

  const generateMnemonic = (state) => {
    const newWalletMnemonic = Cardano.generateMnemonic()
    return {
      newWalletMnemonic,
      currentWalletMnemonicOrSecret: newWalletMnemonic,
      activeWalletId: null,
    }
  }

  const logout = () => {
    wallet = null
    return {activeWalletId: null}
  }

  const reloadWalletInfo = async (state) => {
    setState(loadingAction(state, 'Reloading wallet info...'))

    const balance = await wallet.getBalance()
    const usedAddresses = await wallet.getUsedAddresses()
    const transactionHistory = await wallet.getHistory()
    const unusedAddresses = getState().unusedAddresses.filter(
      (elem) => usedAddresses.indexOf(elem) < 0
    )

    setState({
      balance,
      usedAddresses,
      unusedAddresses,
      transactionHistory,
      loading: false,
    })
  }

  const generateNewUnusedAddress = async (state) => {
    setState({address: 'loading...'})
    const offset = state.unusedAddresses.length
    const newUnusedAddress = await wallet.getChangeAddress(Number.MAX_SAFE_INTEGER, offset)
    setState({
      unusedAddresses: state.unusedAddresses.concat([newUnusedAddress]),
    })
  }

  const toggleAboutOverlay = (state) => ({
    displayAboutOverlay: !state.displayAboutOverlay,
  })

  const inputAddress = (state, e) => ({
    sendAddress: e.target.value,
  })

  // is being called debounced, thus we need to getState
  // TODO maybe it'd be good practice to only use getState and avoid this problem?
  const calculateFee = async () => {
    const state = getState()
    const address = state.sendAddress
    const sendValue = state.sendAmountFieldValue
    const amount = parseFloat(state.sendAmountFieldValue || 0)
    const transactionFee = await wallet.getTxFee(address, amount)
    // if we reverted value in the meanwhile, do nothing, otherwise update
    if (state.sendAmountFieldValue !== state.feeCalculatedFrom) {
      setState({transactionFee, feeCalculatedFrom: sendValue})
    }
  }

  const debouncedCalculateFee = debounceEvent((state) => setState(calculateFee(state)), 2000)

  const inputAmount = (state, e) => {
    debouncedCalculateFee()
    return {
      sendAmountFieldValue: e.target.value,
    }
  }

  const submitTransaction = async (state) => {
    const address = state.sendAddress
    const amount = state.sendAmount
    setState(
      loadingAction(state, 'processing transaction', 'Submitting transaction...', {
        sendSuccess: 'processing transaction',
      })
    )

    const sendSuccess = await wallet.sendAda(address, amount * 1000000)

    setState({sendSuccess, loading: false})
  }

  return {
    loadingAction,
    loadWalletFromMnemonic,
    generateMnemonic,
    logout,
    reloadWalletInfo,
    generateNewUnusedAddress,
    toggleAboutOverlay,
    calculateFee,
    submitTransaction,
    inputAddress,
    inputAmount,
  }
}
