const {generateMnemonic} = require('./wallet/mnemonic')
const {CARDANOLITE_CONFIG} = require('./config')
const {DERIVATION_SCHEMES} = require('./wallet/constants')
const FileSaver = require('file-saver')
const {
  sendAddressValidator,
  sendAmountValidator,
  feeValidator,
  mnemonicValidator,
} = require('./helpers/validators')
const printAda = require('./helpers/printAda')
const debugLog = require('./helpers/debugLog')
const sleep = require('./helpers/sleep')
const {ADA_DONATION_ADDRESS} = require('./wallet/constants')
const NamedError = require('./helpers/NamedError')

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
          wallet = await import(/* webpackPrefetch: true */ './wallet/cardano-wallet').then(
            (Cardano) =>
              Cardano.CardanoWallet({
                cryptoProvider: 'trezor',
                config: CARDANOLITE_CONFIG,
                network: 'mainnet',
                derivationScheme: DERIVATION_SCHEMES.v1,
              })
          )
        } catch (e) {
          debugLog(e)
          return setState({
            loading: false,
            walletLoadingError: {code: 'TrezorRejected'},
          })
        }
        break
      case 'mnemonic':
        secret = secret.trim()
        wallet = await import(/* webpackPrefetch: true */ './wallet/cardano-wallet').then(
          (Cardano) =>
            Cardano.CardanoWallet({
              cryptoProvider: 'mnemonic',
              mnemonicOrHdNodeString: secret,
              config: CARDANOLITE_CONFIG,
              network: 'mainnet',
              // derivationScheme: DERIVATION_SCHEMES.v2,
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
      debugLog(e.toString())
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
      mnemonic: generateMnemonic(15),
      mnemonicValidationError: undefined,
      showGenerateMnemonicDialog: true,
    })
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

  const updateMnemonic = async (state, e) => {
    setState({
      mnemonic: e.target.value,
      mnemonicValidationError: await mnemonicValidator(e.target.value),
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
        setState({
          showAddressDetail: undefined,
        })
      }
    }
  }

  const openAddressDetail = (state, {address, bip32path}) => {
    const showAddressVerification = state.usingTrezor && bip32path //because we don't want to
    // trigger trezor address verification for the  donation address
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

    // timeout setting loading state, so that loading shows even if everything was cached
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

  const sendMaxFunds = async (state) => {
    setState({calculatingFee: true})

    const maxAmount = await wallet.getMaxSendableAmount(state.sendAddress.fieldValue)

    if (maxAmount > 0) {
      setState({
        sendResponse: '',
        sendAmount: sendAmountValidator(printAda(maxAmount)),
      })
    } else {
      setState({
        sendAmount: Object.assign({}, state.sendAmount, {
          validationError: {code: 'SendAmountCantSendMaxFunds'},
        }),
      })
    }

    validateSendFormAndCalculateFee(state)
  }

  const resetSendForm = (state) => {
    setState({
      sendAmount: {fieldValue: ''},
      sendAddress: {fieldValue: ''},
      sendResponse: '',
      transactionFee: 0,
      loading: false,
      showConfirmTransactionDialog: false,
      isSendAddressValid: false,
    })
  }

  const waitForTxToAppearOnBlockchain = async (state, txHash, pollingInterval, maxRetries) => {
    loadingAction(state, 'Transaction submitted - syncing wallet...')

    for (let pollingCounter = 0; pollingCounter < maxRetries; pollingCounter++) {
      if ((await wallet.fetchTxInfo(txHash)) !== undefined) {
        /*
        * theoretically we should clear the request cache of the wallet
        * to be sure that we fetch the current wallet state
        * but submitting the transaction and syncing of the explorer
        * should take enough time to invalidate the request cache anyway
        */
        await reloadWalletInfo(state)
        return {
          success: true,
          txHash,
          error: undefined,
        }
      } else if (pollingCounter < maxRetries - 1) {
        await sleep(pollingInterval)
      }
    }

    return {
      success: false,
      txHash,
      error: 'TransactionNotFoundInBlockchainAfterSubmission',
    }
  }

  const submitTransaction = async (state) => {
    loadingAction(state, 'Submitting transaction...')
    let sendResponse

    try {
      const address = state.sendAddress.fieldValue
      const amount = state.sendAmount.coins
      const txSubmitResult = await wallet.sendAda(address, amount)

      if (!txSubmitResult) {
        debugLog(txSubmitResult)
        throw NamedError('TransactionRejectedByNetwork')
      }

      sendResponse = await waitForTxToAppearOnBlockchain(state, txSubmitResult.txHash, 5000, 20)

      if (address === ADA_DONATION_ADDRESS) {
        setState({showThanksForDonation: true})
      }
    } catch (e) {
      debugLog(e)
      sendResponse = {
        success: false,
        error: e.name,
      }
    } finally {
      resetSendForm(state)
      setState({
        sendResponse,
      })
    }
  }

  const closeThanksForDonationModal = (state) => {
    setState({
      showThanksForDonation: false,
    })
  }

  const exportJsonWallet = async (state, password, walletName) => {
    const walletExport = await import(/* webpackPrefetch: true */ './wallet/keypass-json').then(
      async (KeypassJson) =>
        JSON.stringify(
          await KeypassJson.exportWalletSecret(wallet.getSecret(), password, walletName)
        )
    )

    const blob = new Blob([walletExport], {type: 'application/json;charset=utf-8'})
    FileSaver.saveAs(blob, `${walletName}.json`)
  }

  return {
    loadingAction,
    stopLoadingAction,
    setAuthMethod,
    loadWallet,
    logout,
    exportJsonWallet,
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
    sendMaxFunds,
    openGenerateMnemonicDialog,
    closeGenerateMnemonicDialog,
    closeDemoWalletWarningDialog,
    confirmGenerateMnemonicDialog,
    closeThanksForDonationModal,
  }
}
