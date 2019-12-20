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
  donationAmountValidator,
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
const {toCoins, toAda, roundWholeAdas} = require('./helpers/adaConverters')
const submitEmailRaw = require('./helpers/submitEmailRaw')
const captureBySentry = require('./helpers/captureBySentry')
const submitFeedbackToSentry = require('./helpers/submitFeedbackToSentry')

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
      // is a error
      debugLog(e)
      captureBySentry(e)
      setState({
        [errorName]: {
          code: e.name,
          params: {
            message: e.message,
            ...options,
          },
        },
        error: e,
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
      const sendAmount = {fieldValue: '', coins: 0}
      const sendAddress = {fieldValue: ''}
      const sendResponse = ''
      const usingHwWallet = wallet.isHwWallet()
      const hwWalletName = usingHwWallet ? wallet.getHwWalletName() : undefined
      const demoRootSecret = (await mnemonicToWalletSecretDef(
        ADALITE_CONFIG.ADALITE_DEMO_WALLET_MNEMONIC
      )).rootSecret
      const isDemoWallet = walletSecretDef && walletSecretDef.rootSecret.equals(demoRootSecret)
      const donationAmount = {fieldValue: '', coins: 0}
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
        donationAmount,
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

  const openAddressDetail = (state, {address, bip32path}, copyOnClick) => {
    /*
    * because we don't want to trigger trezor address
    * verification for the  donation address
    */
    const showAddressVerification = state.usingHwWallet && bip32path

    // trigger trezor address verification for the  donation address
    setState({
      showAddressDetail: {address, bip32path, copyOnClick},
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
      await fetchConversionRates(conversionRates)
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

  const closeStakingBanner = (state) => {
    window.localStorage.setItem('dontShowStakingBanner3', true)
    setState({
      showStakingBanner: false,
    })
  }

  const validateSendForm = (state) => {
    handleError('sendAddressValidationError', sendAddressValidator(state.sendAddress.fieldValue))
    handleError(
      'sendAmountValidationError',
      sendAmountValidator(state.sendAmount.fieldValue, state.sendAmount.coins)
    )
    handleError(
      'donationAmountValidationError',
      donationAmountValidator(state.donationAmount.fieldValue, state.donationAmount.coins)
    )
  }

  const isSendFormFilledAndValid = (state) =>
    state.sendAddress.fieldValue !== '' &&
    state.sendAmount.fieldValue !== '' &&
    !state.sendAddressValidationError &&
    !state.sendAmountValidationError &&
    !state.donationAmountValidationError

  const calculateFee = async () => {
    const state = getState()
    if (!isSendFormFilledAndValid(state)) {
      setState({calculatingFee: false})
      return
    }

    const amount = state.sendAmount.coins
    const donationAmount = state.donationAmount.coins
    let transactionFee
    try {
      transactionFee = await wallet.getTxFee(
        state.sendAddress.fieldValue,
        amount,
        state.donationAmount.fieldValue !== '',
        donationAmount
      )
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
      newState.sendAddress.fieldValue === state.sendAddress.fieldValue &&
      newState.donationAmount.fieldValue === state.donationAmount.fieldValue
    ) {
      setState({
        transactionFee,
        sendAmountForTransactionFee: amount,
        donationAmountForTransactionFee: donationAmount,
      })
      handleError(
        'sendAmountValidationError',
        feeValidator(amount, transactionFee, donationAmount, state.balance)
      )
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

  const getPercentageDonationProperties = async () => {
    const state = getState()
    const percentageDonation = roundWholeAdas(state.sendAmount.coins * 0.002)
    const address = state.sendAddress.fieldValue
    const amount = state.sendAmount.coins
    const transactionFee = await wallet.getTxFee(address, amount, true, percentageDonation)

    return amount + transactionFee + percentageDonation <= state.balance
      ? {
        text: '0.2%',
        value: toAda(percentageDonation),
      }
      : {
        text: '0.1%', // exceeded balance, lower to 1% or MIN
        value: Math.max(
          Math.round(toAda(percentageDonation / 2)),
          ADALITE_CONFIG.ADALITE_MIN_DONATION_VALUE
        ),
      }
  }

  const resetPercentageDonation = () => {
    setState({
      thresholdAmountReached: false,
      percentageDonationValue: 0,
      percentageDonationText: '0.2%',
    })
  }

  const resetAmountFields = (state) => {
    setState({
      donationAmount: {fieldValue: '', coins: 0},
      donationAmountForTransactionFee: 0,
      sendAmountForTransactionFee: 0,
      transactionFee: 0,
      maxDonationAmount: Infinity,
      checkedDonationType: '',
      showCustomDonationInput: false,
    })
    resetPercentageDonation()
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
      sendAmount: {fieldValue: '', coins: 0},
      sendAddress: {fieldValue: ''},
    })
    resetAmountFields()
  }

  const resetDonation = () => {
    setState({
      checkedDonationType: '',
      donationAmount: {fieldValue: '', coins: 0},
    })
  }

  const isSendAmountNonPositive = (fieldValue, validationError) =>
    fieldValue === '' ||
    (validationError &&
      (validationError.code === 'SendAmountIsNotPositive' ||
        validationError.code === 'SendAmountIsNan'))

  const updateEmail = (state, e) => {
    setState({
      userEmail: e.target.value,
    })
  }

  const updateName = (state, e) => {
    setState({
      userName: e.target.value,
    })
  }

  const updateMessage = (state, e) => {
    setState({
      userComments: e.target.value,
    })
  }

  const submitUserFeedbackToSentry = async (state) => {
    await submitFeedbackToSentry(
      state.userComments,
      state.userEmail || 'user@email.com',
      state.userName || 'user',
      state.sendSentry.event.event_id
    )
  }

  const debouncedCalculateFee = debounceEvent(calculateFee, 2000)

  const validateSendFormAndCalculateFee = () => {
    validateSendForm(getState())
    const state = getState()

    if (isSendFormFilledAndValid(state)) {
      setState({calculatingFee: true})
      debouncedCalculateFee()
    } else {
      if (isSendAmountNonPositive(state.sendAmount.fieldValue, state.sendAmountValidationError)) {
        resetAmountFields()
      }
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

  const setDonation = (state, value) => {
    setState({
      donationAmount: Object.assign({}, state.donationAmount, {
        fieldValue: value.toString(),
        coins: parseCoins(value.toString()) || 0,
      }),
    })
    validateSendFormAndCalculateFee()
  }

  const getProperTextAndVal = async (coins) => {
    if (coins < toCoins(500 * ADALITE_CONFIG.ADALITE_MIN_DONATION_VALUE)) {
      //because 0.2%
      return {
        text: 'Min',
        value: ADALITE_CONFIG.ADALITE_MIN_DONATION_VALUE,
        thresholdReached: false,
      }
    }

    const percentageProperties = await getPercentageDonationProperties()
    return {
      text: percentageProperties.text,
      value: percentageProperties.value,
      thresholdReached: true,
    }
  }

  const handleThresholdAmount = async () => {
    const state = getState()
    const donationProperties = await getProperTextAndVal(state.sendAmount.coins)

    if (state.checkedDonationType === 'percentage') {
      // %-button is selected, adjust % value because sendAmount changed
      setDonation(state, donationProperties.value)
    }

    if (state.checkedDonationType === 'percentage' || donationProperties.thresholdReached) {
      // update %-button text and value
      setState({
        percentageDonationValue: donationProperties.value,
        percentageDonationText: donationProperties.text,
        thresholdAmountReached: true,
      })
    } else {
      // disable and reset %-button because sendAmount is too low
      resetPercentageDonation()
    }
  }

  const calculateMaxDonationAmount = async () => {
    const state = getState()
    const maxDonationAmount = await wallet.getMaxDonationAmount(
      state.sendAddress.fieldValue,
      state.sendAmount.coins
    )
    let newMaxDonationAmount
    if (maxDonationAmount >= toCoins(ADALITE_CONFIG.ADALITE_MIN_DONATION_VALUE)) {
      newMaxDonationAmount = maxDonationAmount
    } else {
      newMaxDonationAmount = 0
      resetDonation()
    }

    setState({
      maxDonationAmount: newMaxDonationAmount,
    })
  }

  const updateAmount = (state, e) => {
    setState({
      sendResponse: '',
      sendAmount: Object.assign({}, state.sendAmount, {
        fieldValue: e.target.value,
        coins: parseCoins(e.target.value) || 0,
      }),
    })

    validateSendFormAndCalculateFee()
    if (isSendFormFilledAndValid(getState())) {
      handleThresholdAmount()
      calculateMaxDonationAmount()
    }
  }

  const validateAndSetMaxFunds = (state, maxAmounts) => {
    /* maxAmounts.donationAmount exists only if user triggers
      this function with percentage donation selected */

    setState({
      sendResponse: '',
      sendAmount: {
        fieldValue: printAda(maxAmounts.sendAmount),
        coins: maxAmounts.sendAmount || 0,
      },
      maxDonationAmount: maxAmounts.donationAmount || state.donationAmount.coins,
    })
    handleThresholdAmount() // because sendAmount might have reached threshold

    if (maxAmounts.donationAmount) {
      setState({
        percentageDonationValue: toAda(maxAmounts.donationAmount),
        percentageDonationText: '0.2%',
        donationAmount: {
          fieldValue: printAda(maxAmounts.donationAmount),
          coins: maxAmounts.donationAmount || 0,
        },
      })
    }
    validateSendFormAndCalculateFee()
  }

  const sendMaxFunds = async (state) => {
    setState({calculatingFee: true})
    const maxAmounts = await wallet
      .getMaxSendableAmount(
        state.sendAddress.fieldValue,
        state.donationAmount.fieldValue !== '',
        state.donationAmount.coins,
        state.checkedDonationType
      )
      .catch((e) => {
        setState({
          calculatingFee: false,
        })
        handleError('sendAmountValidationError', {code: e.name})
        return
      })
    validateAndSetMaxFunds(state, maxAmounts)
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
      const hasDonation = state.donationAmount.fieldValue !== ''
      const donationAmount = state.donationAmount.coins
      const signedTx = await wallet.prepareSignedTx(address, amount, hasDonation, donationAmount)
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

      if (address === ADA_DONATION_ADDRESS || hasDonation) {
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
    const txAux = await wallet
      .prepareTxAux(
        address,
        coins,
        state.donationAmount.fieldValue !== '',
        state.donationAmount.coins
      )
      .catch((e) => {
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

  const submitEmail = async (state, email) => {
    let didSucceed
    let message
    try {
      const emailSubmitResult = await submitEmailRaw(email)

      if (emailSubmitResult.Left) {
        didSucceed = false
        message = emailSubmitResult.Left
        throw NamedError('EmailSubmissionRejected')
      }

      didSucceed = true
      message = emailSubmitResult.Right
    } catch (e) {
      debugLog(e)
    } finally {
      setState({
        emailSubmitSuccess: didSucceed,
        emailSubmitMessage: message,
      })
    }
  }

  const resetEmailSubmission = (state) => {
    setState({
      emailSubmitSuccess: false,
      emailSubmitMessage: '',
    })
  }

  const updateDonation = (state, e) => {
    if (state.checkedDonationType === e.target.id && e.target.id !== 'custom') {
      // when clicking already selected button
      resetDonation()
    } else {
      setState({
        donationAmount: Object.assign({}, state.donationAmount, {
          fieldValue: e.target.value,
          coins: parseCoins(e.target.value) || 0,
        }),
        checkedDonationType: e.target.id,
      })
    }
    validateSendFormAndCalculateFee()
  }

  const toggleCustomDonation = (state) => {
    resetDonation()
    setState({
      showCustomDonationInput: !state.showCustomDonationInput,
    })
    validateSendFormAndCalculateFee()
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
    updateName,
    updateEmail,
    updateMessage,
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
    submitUserFeedbackToSentry,
    showContactFormModal,
    closeContactFormModal,
    updateDonation,
    toggleCustomDonation,
    setDonation,
    resetDonation,
    closeStakingBanner,
    submitEmail,
    resetEmailSubmission,
  }
}
