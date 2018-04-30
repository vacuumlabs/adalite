import Cardano from '../wallet/cardano-wallet'
import {CARDANOLITE_CONFIG} from './config'

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
    const sendAmount = {fieldValue: ''}
    const sendAddress = {fieldValue: ''}
    const sendSuccess = ''
    setState({
      activeWalletId,
      usedAddresses,
      unusedAddresses,
      balance,
      sendAmount,
      sendAddress,
      sendSuccess,
      transactionHistory,
      loading: false,
      currentWalletMnemonicOrSecret: '',
    })
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
    const newUnusedAddress = await wallet.getChangeAddress(
      Number.MAX_SAFE_INTEGER,
      offset
    )
    setState({
      unusedAddresses: state.unusedAddresses.concat([newUnusedAddress]),
    })
  }

  const toggleAboutOverlay = (state, rememberInStorage) => {
    // we may get an ignored click event as the second argument, check only against booleans
    if (rememberInStorage === true) {
      window.localStorage.setItem('dontShowDisclaimer', true)
    }
    return {
      displayAboutOverlay: !state.displayAboutOverlay,
    }
  }

  const validateSendAddress = (state) =>
    setState({
      sendAddress: Object.assign({}, state.sendAddress, {
        validationError: !Cardano.isValidAddress(state.sendAddress.fieldValue)
          ? {code: 'SendAddressInvalidAddress'}
          : null,
      }),
    })

  const validateSendAmount = (state) => {
    let validationError = null
    const strAmount = state.sendAmount.fieldValue
    const amount = parseFloat(strAmount)

    if (isNaN(amount) || strAmount.toLowerCase().includes('e')) {
      validationError = {code: 'SendAmountIsNan'}
    } else if (amount <= 0) {
      validationError = {code: 'SendAmountIsNotPositive'}
    } else if (strAmount.split('.').length === 2 && strAmount.split('.')[1].length > 6) {
      validationError = {code: 'SendAmountPrecisionLimit'}
    }

    setState({sendAmount: Object.assign({}, state.sendAmount, {validationError})})
  }

  const validateSendForm = (state) => {
    if (
      state.sendAddress.fieldValue !== '' &&
      state.sendAmount.fieldValue !== ''
    ) {
      validateSendAddress(state)
      validateSendAmount(state)
    }
  }

  const validateFee = (state) => {
    const sendAmountForTransactionFee = state.sendAmountForTransactionFee
    const transactionFee = state.transactionFee
    const balance = state.balance

    if (sendAmountForTransactionFee + transactionFee > balance) {
      setState({
        sendAmount: Object.assign({}, state.sendAmount, {
          validationError: {code: 'SendAmountInsufficientFunds', params: {balance: state.balance}},
        }),
      })
    }
  }

  const isSendFormFilledAndValid = (state) =>
    state.sendAddress.fieldValue !== '' &&
    state.sendAmount.fieldValue !== '' &&
    !state.sendAddress.validationError &&
    !state.sendAmount.validationError

  const calculateFee = async () => {
    const state = getState()
    if (!isSendFormFilledAndValid(state)) {
      setState({calculatingFee: false})
      return
    }

    const address = state.sendAddress.fieldValue
    const amount = Math.floor(parseFloat(state.sendAmount.fieldValue) * 1000000)
    const transactionFee = await wallet.getTxFee(address, amount)

    // if we reverted value in the meanwhile, do nothing, otherwise update
    const newState = getState()
    if (
      newState.sendAmount.fieldValue === state.sendAmount.fieldValue &&
      newState.sendAddress.fieldValue === state.sendAddress.fieldValue
    ) {
      setState({
        transactionFee,
        sendAmountForTransactionFee: amount,
      })
    }
    validateFee(getState())
    setState({calculatingFee: false})
  }

  const confirmTransaction = () => ({showConfirmTransactionDialog: true})

  const cancelTransaction = () => ({showConfirmTransactionDialog: false})

  const debouncedCalculateFee = debounceEvent(calculateFee, 2000)

  const validateSendFormAndCalculateFee = () => {
    validateSendForm(getState())
    if (isSendFormFilledAndValid(getState())) {
      setState({calculatingFee: true})
      debouncedCalculateFee()
    } else {
      setState({calculatingFee: false})
    }
  }

  const updateAddress = (state, e) => {
    setState({
      sendAddress: Object.assign({}, state.sendAddress, {
        fieldValue: e.target.value,
      }),
    })
    validateSendFormAndCalculateFee()
  }

  const updateAmount = (state, e) => {
    setState({
      sendAmount: Object.assign({}, state.sendAmount, {
        fieldValue: e.target.value,
      }),
    })
    validateSendFormAndCalculateFee()
  }

  const submitTransaction = async (state) => {
    setState(
      loadingAction(
        state,
        'processing transaction',
        'Submitting transaction...'
      )
    )
    try {
      const address = state.sendAddress.fieldValue
      const amount = parseFloat(state.sendAmount.fieldValue) * 1000000
      const sendSuccess = await wallet.sendAda(address, amount)
      setState({
        sendSuccess,
        loading: false,
        showConfirmTransactionDialog: false,
      })
    } catch (e) {
      setState({
        sendSuccess: false,
        loading: false,
        showConfirmTransactionDialog: false,
      })
    }
  }

  return {
    loadingAction,
    loadWalletFromMnemonic,
    logout,
    reloadWalletInfo,
    generateNewUnusedAddress,
    toggleAboutOverlay,
    calculateFee,
    confirmTransaction,
    cancelTransaction,
    submitTransaction,
    updateAddress,
    updateAmount,
  }
}
