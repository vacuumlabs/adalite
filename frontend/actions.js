const generateMnemonic = require('../wallet/mnemonic').generateMnemonic
const CARDANOLITE_CONFIG = require('./config').CARDANOLITE_CONFIG
const exportWalletSecret = require('../wallet/keypass-json').exportWalletSecret
const FileSaver = require('file-saver')
const {
  sendAddressValidator,
  sendAmountValidator,
  feeValidator,
  mnemonicValidator,
} = require('./validators')
const printAda = require('./printAda')

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

module.exports = ({setState, getState}) => {
  const loadingAction = (state, message, optionalArgsObj) => {
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

  const setAuthMethod = (state, option) => {
    setState({
      authMethod: option,
    })
  }

  const loadWallet = async (state, {cryptoProvider, secret}) => {
    loadingAction(state, 'Loading wallet data...', {walletLoadingError: undefined})
    switch (cryptoProvider) {
      case 'trezor':
        try {
          wallet = await import(/* webpackPrefetch: true */ '../wallet/cardano-wallet').then(
            (Cardano) =>
              Cardano.CardanoWallet({
                cryptoProvider: 'trezor',
                config: CARDANOLITE_CONFIG,
              })
          )
        } catch (e) {
          // eslint-disable-next-line no-console
          console.error(e.toString())
          return setState({
            loading: false,
            walletLoadingError: {code: 'TrezorRejected'},
          })
        }
        break
      case 'mnemonic':
        secret = secret.trim()
        wallet = await import(/* webpackPrefetch: true */ '../wallet/cardano-wallet').then(
          (Cardano) =>
            Cardano.CardanoWallet({
              cryptoProvider: 'mnemonic',
              mnemonicOrHdNodeString: secret,
              config: CARDANOLITE_CONFIG,
            })
        )
        break
      default:
        return setState({
          loading: false,
          walletLoadingError: {
            code: 'UnknownCryptoProvider',
            params: {cryptoProvider},
          },
        })
    }
    try {
      const walletIsLoaded = true
      const ownAddressesWithMeta = await wallet.getOwnAddressesWithMeta()
      const transactionHistory = await wallet.getHistory()
      const balance = await wallet.getBalance()
      const sendAmount = {fieldValue: ''}
      const sendAddress = {fieldValue: ''}
      const sendResponse = ''
      const usingTrezor = cryptoProvider === 'trezor'
      const isDemoWallet = secret === CARDANOLITE_CONFIG.CARDANOLITE_DEMO_WALLET_MNEMONIC
      setState({
        walletIsLoaded,
        ownAddressesWithMeta,
        balance,
        sendAmount,
        sendAddress,
        isSendAddressValid: false,
        sendResponse,
        transactionHistory,
        loading: false,
        mnemonic: '',
        usingTrezor,
        isDemoWallet,
        showDemoWalletWarningDialog: isDemoWallet,
        showGenerateMnemonicDialog: false,
      })
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error(e.toString())
      setState({
        walletLoadingError: {
          code: 'WalletInitializationError',
        },
      })
    }
    return true
  }

  const loadDemoWallet = (state) => {
    setState({
      mnemonic: CARDANOLITE_CONFIG.CARDANOLITE_DEMO_WALLET_MNEMONIC,
      mnemonicValidationError: undefined,
      walletLoadingError: undefined,
    })
  }

  const openGenerateMnemonicDialog = (state) => {
    setState({
      mnemonic: generateMnemonic(),
      mnemonicValidationError: undefined,
      showGenerateMnemonicDialog: true,
    })
  }

  const sendAllFunds = async (state) => {
    setState({calculatingFee: true})

    const balance = await wallet.getBalance()
    const txFee = await wallet.getAllFundsTxFee(state.sendAddress.fieldValue)
    const allFundsSendable = balance > txFee
    if (allFundsSendable) {
      setState({
        sendResponse: '',
        sendAmount: sendAmountValidator(printAda(state.balance - txFee)),
      })
    } else {
      setState({
        sendAmount: Object.assign({}, state.sendAmount, {
          validationError: {code: 'SendAmountCantSendAllFunds'},
        }),
      })
    }

    validateSendFormAndCalculateFee(state)
  }

  const closeGenerateMnemonicDialog = (state) => {
    setState({
      mnemonic: '',
      mnemonicValidationError: undefined,
      showGenerateMnemonicDialog: false,
    })
  }

  const closeDemoWalletWarningDialog = (state) => {
    setState({
      showDemoWalletWarningDialog: false,
    })
  }

  const confirmGenerateMnemonicDialog = (state) => {
    setState({
      showGenerateMnemonicDialog: false,
    })
  }

  const updateMnemonic = (state, e) => {
    setState({
      mnemonic: e.target.value,
      mnemonicValidationError: mnemonicValidator(e.target.value),
      showMnemonicValidationError: false,
    })
  }

  const checkForMnemonicValidationError = (state) => {
    setState({
      showMnemonicValidationError: !!state.mnemonicValidationError,
    })
  }

  const verifyAddress = async (address) => {
    const state = getState()
    if (state.usingTrezor && state.showAddressDetail) {
      try {
        await wallet.verifyAddress(address)
        setState({showAddressVerification: false})
      } catch (e) {
        console.error('User rejected the address on trezor!')
        setState({
          showAddressDetail: undefined,
        })
      }
    }
  }

  const openAddressDetail = (state, {address, bip32path}) => {
    const showAddressVerification = state.usingTrezor
    setState({
      showAddressDetail: {address, bip32path},
      showAddressVerification,
    })
    if (showAddressVerification) {
      setTimeout(() => verifyAddress(address), 1250)
    }
  }

  const closeAddressDetail = (state) => {
    setState({
      showAddressDetail: undefined,
      addressVerificationError: undefined,
      showAddressVerification: undefined,
    })
  }

  const logout = () => {
    wallet = null
    return {walletIsLoaded: false}
  }

  const reloadWalletInfo = async (state) => {
    loadingAction(state, 'Reloading wallet info...')

    const balance = await wallet.getBalance()
    const ownAddressesWithMeta = await wallet.getOwnAddressesWithMeta()
    const transactionHistory = await wallet.getHistory()

    // timeout setting loading state, so that loading shows even if everything was cashed
    setTimeout(() => setState({loading: false}), 500)
    setState({
      balance,
      ownAddressesWithMeta,
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
    setState({
      isSendAddressValid: !sendAddressValidator(state.sendAddress.fieldValue).validationError,
    })

    if (state.sendAddress.fieldValue !== '' && state.sendAmount.fieldValue !== '') {
      setState({
        sendAddress: sendAddressValidator(state.sendAddress.fieldValue),
        sendAmount: sendAmountValidator(state.sendAmount.fieldValue),
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
    const transactionFee = await wallet.getTxFee(amount, address)

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
    loadingAction(state, 'processing transaction', 'Submitting transaction...')
    try {
      const address = state.sendAddress.fieldValue
      const amount = state.sendAmount.coins
      const sendResponse = await wallet.sendAda(address, amount)
      const updatedBalance = await wallet.getBalance()
      if (sendResponse.success) {
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

  const openExportJsonWalletDialog = (state) => {
    setState({
      showExportJsonWalletDialog: true,
    })
  }

  const closeExportJsonWalletDialog = (state) => {
    setState({
      showExportJsonWalletDialog: false,
    })
  }

  const exportJsonWallet = async (state, password, walletName) => {
    const walletExport = JSON.stringify(
      await exportWalletSecret(wallet.getSecret(), password, walletName)
    )
    const blob = new Blob([walletExport], {type: 'application/json;charset=utf-8'})
    FileSaver.saveAs(blob, `${walletName}.json`)

    setState({
      showExportJsonWalletDialog: false,
    })
  }

  return {
    loadingAction,
    stopLoadingAction,
    setAuthMethod,
    loadWallet,
    logout,
    exportJsonWallet,
    openExportJsonWalletDialog,
    closeExportJsonWalletDialog,
    reloadWalletInfo,
    toggleAboutOverlay,
    calculateFee,
    confirmTransaction,
    cancelTransaction,
    submitTransaction,
    updateAddress,
    updateAmount,
    loadDemoWallet,
    updateMnemonic,
    checkForMnemonicValidationError,
    openAddressDetail,
    closeAddressDetail,
    verifyAddress,
    sendAllFunds,
    openGenerateMnemonicDialog,
    closeGenerateMnemonicDialog,
    closeDemoWalletWarningDialog,
    confirmGenerateMnemonicDialog,
  }
}
