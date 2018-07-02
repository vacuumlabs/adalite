import Cardano from '../wallet/cardano-wallet'
import {CARDANOLITE_CONFIG} from './config'
import {
  sendAddressValidator,
  sendAmountValidator,
  feeValidator,
  mnemonicValidator,
} from './validators'

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

  const loadWalletFromMnemonic = async (state) => {
    try {
      setState(Object.assign(loadingAction(state, 'Loading wallet data...'), {mn: undefined}))

      wallet = await Cardano.CardanoWallet({
        cryptoProvider: 'mnemonic',
        mnemonicOrHdNodeString: state.mnemonic,
        config: CARDANOLITE_CONFIG,
      })

      const walletIsLoaded = true
      const ownAddresses = await wallet.getOwnAddresses()
      const transactionHistory = await wallet.getHistory()
      const balance = await wallet.getBalance()
      const sendAmount = {fieldValue: ''}
      const sendAddress = {fieldValue: ''}
      const sendResponse = ''
      setState({
        walletIsLoaded,
        ownAddresses,
        balance,
        sendAmount,
        sendAddress,
        sendResponse,
        transactionHistory,
        loading: false,
        mnemonic: '',
      })
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error(e.toString())

      setState({
        mnemonicValidationError: {
          code: 'WalletInitializationError',
        },
      })
    }
  }

  const loadDemoWallet = (state) => {
    setState({
      mnemonic: 'civil void tool perfect avocado sweet immense fluid arrow aerobic boil flash',
      mnemonicValidationError: undefined,
    })
  }

  const generateMnemonic = (state) => {
    setState({
      mnemonic: Cardano.generateMnemonic(),
      mnemonicValidationError: undefined,
    })
  }

  const updateMnemonic = (state, e) => {
    setState({
      mnemonic: e.target.value,
      mnemonicValidationError: mnemonicValidator(e.target.value),
    })
  }

  const logout = () => {
    wallet = null
    return {walletIsLoaded: false}
  }

  const reloadWalletInfo = async (state) => {
    setState(loadingAction(state, 'Reloading wallet info...'))

    const balance = await wallet.getBalance()
    const ownAddresses = await wallet.getOwnAddresses()
    const transactionHistory = await wallet.getHistory()

    // timeout setting loading state, so that loading shows even if everything was cashed
    setTimeout(() => setState({loading: false}), 500)
    setState({
      balance,
      ownAddresses,
      transactionHistory,
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

  const validateSendForm = (state) => {
    if (state.sendAddress.fieldValue !== '' && state.sendAmount.fieldValue !== '') {
      setState({
        sendAddress: sendAddressValidator(state.sendAddress),
        sendAmount: sendAmountValidator(state.sendAmount),
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
    const amount = state.sendAmount.coins
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
        sendAmount: Object.assign({}, state.sendAmount, {
          validationError: feeValidator(amount, transactionFee, state.balance),
        }),
      })
    }

    setState({
      calculatingFee: false,
    })
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
      sendResponse: '',
      sendAddress: Object.assign({}, state.sendAddress, {
        fieldValue: e.target.value,
      }),
    })
    validateSendFormAndCalculateFee()
  }

  const updateAmount = (state, e) => {
    setState({
      sendResponse: '',
      sendAmount: Object.assign({}, state.sendAmount, {
        fieldValue: e.target.value,
      }),
    })
    validateSendFormAndCalculateFee()
  }

  const submitTransaction = async (state) => {
    setState(loadingAction(state, 'processing transaction', 'Submitting transaction...'))
    try {
      const address = state.sendAddress.fieldValue
      const amount = state.sendAmount.coins
      const sendResponse = await wallet.sendAda(address, amount)
      const updatedBalance = await wallet.getBalance()
      if (sendResponse) {
        setTimeout(() => setState({sendResponse: ''}), 4000)
        setState({
          sendAmount: {fieldValue: ''},
          sendAddress: {fieldValue: ''},
          transactionFee: 0,
        })
      }
      setState({
        balance: updatedBalance,
        sendResponse,
        loading: false,
        showConfirmTransactionDialog: false,
      })
    } catch (e) {
      setState({
        sendResponse: false,
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
    toggleAboutOverlay,
    calculateFee,
    confirmTransaction,
    cancelTransaction,
    submitTransaction,
    updateAddress,
    updateAmount,
    loadDemoWallet,
    generateMnemonic,
    updateMnemonic,
  }
}
