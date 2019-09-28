const {generateMnemonic} = require('./wallet/mnemonic')
const {ADALITE_CONFIG} = require('./config')
const FileSaver = require('file-saver')
const cbor = require('borc')
const {
  parseCoins,
  sendAddressValidator,
  sendAmountValidator,
  feeValidator,
  mnemonicValidator,
} = require('./helpers/validators')
const printAda = require('./helpers/printAda')
const debugLog = require('./helpers/debugLog')
const getConversionRates = require('./helpers/getConversionRates')
const sleep = require('./helpers/sleep')
const {ADA_DONATION_ADDRESS, NETWORKS} = require('./wallet/constants')
const NamedError = require('./helpers/NamedError')
const KeypassJson = require('./wallet/keypass-json')
const {CardanoWallet} = require('./wallet/cardano-wallet')
const mnemonicToWalletSecretDef = require('./wallet/helpers/mnemonicToWalletSecretDef')
const sanitizeMnemonic = require('./helpers/sanitizeMnemonic')
const {initialState} = require('./store')
const captureBySentry = require('./helpers/captureBySentry')

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

  const handleError = (errorName, e, options) => {
    if (e && e.name) {
      debugLog(e)
      captureBySentry(e)
      setState({
        [errorName]: {
          code: e.name,
          params: {
            message: e.message,
            showHelp: e.showHelp,
            ...options,
          },
        },
        error: e.showHelp ? e : undefined,
      })
    } else {
      setState({
        [errorName]: e,
      })
    }
  }

  const setAuthMethod = (state, option) => {
    setState({
      authMethod: option,
      showExportOption: option === 'mnemonic' || option === 'file',
    })
  }

  const fetchConversionRates = async (conversionRates) => {
    try {
      setState({
        conversionRates: await conversionRates,
      })
    } catch (e) {
      debugLog('Could not fetch conversion rates.')
      setState({
        conversionRates: null,
      })
      throw NamedError('ConversionRatesError', '`Could not fetch conversion rates.')
    }
    return true
  }

  const loadWallet = async (state, {cryptoProviderType, walletSecretDef}) => {
    loadingAction(state, 'Loading wallet data...', {walletLoadingError: undefined})
    try {
      wallet = await CardanoWallet({
        cryptoProviderType,
        walletSecretDef,
        config: ADALITE_CONFIG,
        network: NETWORKS.MAINNET,
      })

      const walletIsLoaded = true
      const ownAddressesWithMeta = await wallet.getFilteredVisibleAddressesWithMeta()
      const transactionHistory = await wallet.getHistory()
      const balance = await wallet.getBalance()
      const conversionRates = getConversionRates(state)
      const sendAmount = {fieldValue: ''}
      const sendAddress = {fieldValue: ''}
      const sendResponse = ''
      const usingHwWallet = wallet.isHwWallet()
      const hwWalletName = usingHwWallet ? wallet.getHwWalletName() : undefined
      const demoRootSecret = (await mnemonicToWalletSecretDef(
        ADALITE_CONFIG.ADALITE_DEMO_WALLET_MNEMONIC
      )).rootSecret
      const isDemoWallet = walletSecretDef && walletSecretDef.rootSecret.equals(demoRootSecret)
      setState({
        walletIsLoaded,
        ownAddressesWithMeta,
        balance,
        sendAmount,
        sendAddress,
        sendResponse,
        transactionHistory,
        loading: false,
        mnemonicInputValue: '',
        usingHwWallet,
        hwWalletName,
        isDemoWallet,
        showDemoWalletWarningDialog: isDemoWallet,
        showGenerateMnemonicDialog: false,
      })
      await fetchConversionRates(conversionRates)
    } catch (e) {
      setState({
        loading: false,
      })
      handleError('walletLoadingError', e)
      setState({
        showWalletLoadingErrorModal: true,
      })
      return false
    }
    return true
  }

  const loadDemoWallet = (state) => {
    setState({
      mnemonicInputValue: ADALITE_CONFIG.ADALITE_DEMO_WALLET_MNEMONIC,
      mnemonicValidationError: undefined,
      walletLoadingError: undefined,
      showWalletLoadingErrorModal: false,
      authMethod: 'mnemonic',
      showExportOption: true,
    })
  }

  const openGenerateMnemonicDialog = (state) => {
    setState({
      newWalletMnemonic: generateMnemonic(15),
      mnemonicInputValue: '',
      showGenerateMnemonicDialog: true,
      authMethod: 'mnemonic',
      showMnemonicInfoAlert: true,
    })
  }

  const closeGenerateMnemonicDialog = (state) => {
    setState({
      newWalletMnemonic: '',
      showGenerateMnemonicDialog: false,
    })
  }

  const closeDemoWalletWarningDialog = (state) => {
    setState({
      showDemoWalletWarningDialog: false,
    })
  }

  const closeWalletLoadingErrorModal = (state) => {
    setState({
      showWalletLoadingErrorModal: false,
    })
  }

  const confirmGenerateMnemonicDialog = (state) => {
    setState({
      newWalletMnemonic: '',
      showGenerateMnemonicDialog: false,
    })
  }

  const updateMnemonic = async (state, e) => {
    const mnemonicInputValue = e.target.value
    setState({
      mnemonicInputValue,
      showMnemonicValidationError: false,
    })
    handleError(
      'mnemonicValidationError',
      await mnemonicValidator(sanitizeMnemonic(mnemonicInputValue))
    )
  }

  const checkForMnemonicValidationError = (state) => {
    setState({
      showMnemonicValidationError: !!state.mnemonicValidationError,
    })
  }

  const verifyAddress = async (address) => {
    const state = getState()
    if (state.usingHwWallet && state.showAddressDetail) {
      try {
        setState({
          waitingForHwWallet: true,
          addressVerificationError: false,
        })
        await wallet.verifyAddress(state.showAddressDetail.address)
        setState({waitingForHwWallet: false})
      } catch (e) {
        setState({
          waitingForHwWallet: false,
        })
        handleError('addressVerificationError', true)
      }
    }
  }

  const openAddressDetail = (state, {address, bip32path}) => {
    /*
    * because we don't want to trigger trezor address
    * verification for the  donation address
    */
    const showAddressVerification = state.usingHwWallet && bip32path

    // trigger trezor address verification for the  donation address
    setState({
      showAddressDetail: {address, bip32path},
      showAddressVerification,
    })
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
    setState(
      {
        ...initialState,
        displayWelcome: false,
      },
      true
    ) // force overwriting the state
    window.history.pushState({}, '/', '/')
  }

  const reloadWalletInfo = async (state) => {
    loadingAction(state, 'Reloading wallet info...')
    try {
      const balance = await wallet.getBalance()
      const ownAddressesWithMeta = await wallet.getFilteredVisibleAddressesWithMeta()
      const transactionHistory = await wallet.getHistory()
      const conversionRates = getConversionRates(state)

      // timeout setting loading state, so that loading shows even if everything was cached
      setTimeout(() => setState({loading: false}), 500)
      setState({
        balance,
        ownAddressesWithMeta,
        transactionHistory,
      })
      await fetchConversionRates(state, conversionRates)
    } catch (e) {
      setState({
        loading: false,
      })
      handleError('walletLoadingError', e)
      setState({
        showWalletLoadingErrorModal: true,
      })
    }
  }

  const openWelcome = (state) => {
    setState({
      displayWelcome: true,
    })
  }

  const closeWelcome = (state, dontShowDisclaimer) => {
    // we may get an ignored click event as the second argument, check only against booleans
    window.localStorage.setItem('dontShowDisclaimer', dontShowDisclaimer)
    setState({
      displayWelcome: false,
    })
  }

  const validateSendForm = (state) => {
    handleError('sendAddressValidationError', sendAddressValidator(state.sendAddress.fieldValue))
    handleError(
      'sendAmountValidationError',
      sendAmountValidator(state.sendAmount.fieldValue, state.sendAmount.coins)
    )
  }

  const isSendFormFilledAndValid = (state) =>
    state.sendAddress.fieldValue !== '' &&
    state.sendAmount.fieldValue !== '' &&
    !state.sendAddressValidationError &&
    !state.sendAmountValidationError

  const calculateFee = async () => {
    const state = getState()
    if (!isSendFormFilledAndValid(state)) {
      setState({calculatingFee: false})
      return
    }

    const address = state.sendAddress.fieldValue
    const amount = state.sendAmount.coins
    let transactionFee
    try {
      transactionFee = await wallet.getTxFee(address, amount)
    } catch (e) {
      handleError('sendAmountValidationError', {code: e.name})
      setState({
        calculatingFee: false,
      })
      return
    }

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
      handleError('sendAmountValidationError', feeValidator(amount, transactionFee, state.balance))
    }
    setState({
      calculatingFee: false,
    })
  }

  const confirmTransaction = () => ({
    showConfirmTransactionDialog: true,
  })

  const cancelTransaction = () => ({
    showConfirmTransactionDialog: false,
  })

  const updateEmail = (state, e) => {
    setState({
      contactEmail: e.target.value,
    })
  }

  const updateName = (state, e) => {
    setState({
      contactName: e.target.value,
    })
  }

  const updateMessage = (state, e) => {
    setState({
      contactMessage: e.target.value,
    })
  }

  const submitUserFeedback = (state) => {
    // TODO
  }

  const debouncedCalculateFee = debounceEvent(calculateFee, 2000)

  const validateSendFormAndCalculateFee = (state) => {
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
        coins: parseCoins(e.target.value),
      }),
    })
    validateSendFormAndCalculateFee()
  }

  const sendMaxFunds = async (state) => {
    setState({calculatingFee: true})
    let maxAmount
    try {
      maxAmount = await wallet.getMaxSendableAmount(state.sendAddress.fieldValue)
      setState({
        sendResponse: '',
        sendAmount: {
          fieldValue: printAda(maxAmount),
          coins: maxAmount || null,
        },
      })
      validateSendFormAndCalculateFee()
    } catch (e) {
      setState({
        calculatingFee: false,
      })
      handleError('sendAmountValidationError', {code: e.name})
    }
  }

  const resetSendFormState = (state) => {
    setState({
      sendResponse: '',
      loading: false,
      showConfirmTransactionDialog: false,
    })
  }

  const resetSendFormFields = (state) => {
    setState({
      sendAmount: {fieldValue: ''},
      sendAddress: {fieldValue: ''},
      transactionFee: 0,
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
        }
      } else if (pollingCounter < maxRetries - 1) {
        await sleep(pollingInterval)
      }
    }

    throw NamedError('TransactionNotFoundInBlockchainAfterSubmission')
  }

  const submitTransaction = async (state) => {
    setState({
      showConfirmTransactionDialog: false,
    })
    if (state.usingHwWallet) {
      setState({waitingForHwWallet: true})
      loadingAction(state, `Waiting for ${state.hwWalletName}...`)
    } else {
      loadingAction(state, 'Submitting transaction...')
    }
    let sendResponse
    let txSubmitResult

    try {
      const address = state.sendAddress.fieldValue
      const amount = state.sendAmount.coins
      const signedTx = await wallet.prepareSignedTx(address, amount)
      if (state.usingHwWallet) {
        setState({waitingForHwWallet: false})
        loadingAction(state, 'Submitting transaction...')
      }
      txSubmitResult = await wallet.submitTx(signedTx)

      if (!txSubmitResult) {
        debugLog(txSubmitResult)
        throw NamedError('TransactionRejectedByNetwork')
      }

      sendResponse = await waitForTxToAppearOnBlockchain(state, txSubmitResult.txHash, 5000, 20)
      if (address === ADA_DONATION_ADDRESS) {
        setState({showThanksForDonation: true})
      }
    } catch (e) {
      handleError('transactionSubmissionError', e, {
        txHash: txSubmitResult && txSubmitResult.txHash,
      })
      setState({
        showTransactionErrorModal: true,
      })
    } finally {
      resetSendFormFields(state)
      resetSendFormState(state)
      wallet.generateNewSeeds()
      setState({
        waitingForHwWallet: false,
        sendResponse,
      })
    }
  }

  const closeThanksForDonationModal = (state) => {
    setState({
      showThanksForDonation: false,
    })
  }

  const closeTransactionErrorModal = (state) => {
    setState({
      showTransactionErrorModal: false,
    })
  }

  const closeUnexpectedErrorModal = (state) => {
    setState({
      showUnexpectedErrorModal: false,
    })
  }

  const showContactFormModal = (state) => {
    setState({
      showContactFormModal: true,
    })
  }

  const closeContactFormModal = (state) => {
    setState({
      showContactFormModal: false,
    })
  }

  const exportJsonWallet = async (state, password, walletName) => {
    const walletExport = JSON.stringify(
      await KeypassJson.exportWalletSecretDef(wallet.getWalletSecretDef(), password, walletName)
    )

    const blob = new Blob([walletExport], {type: 'application/json;charset=utf-8'})
    FileSaver.saveAs(blob, `${walletName}.json`)
  }

  const setLogoutNotificationOpen = (state, open) => {
    setState({
      logoutNotificationOpen: open,
    })
  }

  const setRawTransactionOpen = (state, open) => {
    setState({
      rawTransactionOpen: open,
    })
  }

  const getRawTransaction = async (state, address, coins) => {
    const txAux = await wallet.prepareTxAux(address, coins).catch((e) => {
      handleError('sendAmountValidationError', e, {
        balance: state.balance,
      })
    })
    txAux &&
      setState({
        rawTransaction: Buffer.from(cbor.encode(txAux)).toString('hex'),
        rawTransactionOpen: true,
      })
  }

  return {
    loadingAction,
    stopLoadingAction,
    setAuthMethod,
    loadWallet,
    logout,
    exportJsonWallet,
    reloadWalletInfo,
    openWelcome,
    closeWelcome,
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
    setLogoutNotificationOpen,
    setRawTransactionOpen,
    getRawTransaction,
    closeTransactionErrorModal,
    closeWalletLoadingErrorModal,
    closeUnexpectedErrorModal,
    submitUserFeedback,
    showContactFormModal,
    closeContactFormModal,
  }
}
