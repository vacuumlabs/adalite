const {generateMnemonic} = require('./wallet/mnemonic')
const {ADALITE_CONFIG} = require('./config')
const FileSaver = require('file-saver')
const cbor = require('borc')
const {
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
      showExportOption: option === 'mnemonic' || option === 'file',
    })
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
      const donationAmount = {fieldValue: ''}
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
      try {
        setState({
          conversionRates: await conversionRates,
        })
      } catch (e) {
        debugLog('Could not fetch conversion rates.')
        setState({
          conversionRates: null,
        })
      }
    } catch (e) {
      debugLog(e)
      let message
      switch (e.name) {
        case 'NetworkError':
          message = 'failed to fetch data from blockchain explorer'
          break
        case 'TransportOpenUserCancelled':
        case 'TransportError':
        case 'TransportStatusError':
        case 'TrezorError':
          message = e.message
          break
        default:
          break
      }

      setState({
        walletLoadingError: {
          code: 'WalletInitializationError',
          params: {
            message,
          },
        },
        showWalletLoadingErrorModal: true,
        loading: false,
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
      mnemonicValidationError: await mnemonicValidator(sanitizeMnemonic(mnemonicInputValue)),
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
          addressVerificationError: true,
          waitingForHwWallet: false,
        })
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
    try {
      setState({
        conversionRates: await conversionRates,
      })
    } catch (e) {
      debugLog(`Could not fetch conversion rates: ${e}`)
      setState({
        conversionRates: null,
        loading: false,
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
    setState({
      sendAddress: sendAddressValidator(state.sendAddress.fieldValue),
      sendAmount: sendAmountValidator(state.sendAmount.fieldValue),
      donationAmount: donationAmountValidator(state.donationAmount.fieldValue),
    })
  }

  const isSendFormFilledAndValid = (state) =>
    state.sendAddress.fieldValue !== '' &&
    state.sendAmount.fieldValue !== '' &&
    !state.sendAddress.validationError &&
    !state.sendAmount.validationError &&
    !state.donationAmount.validationError

  const calculateFee = async () => {
    const state = getState()
    if (!isSendFormFilledAndValid(state)) {
      setState({calculatingFee: false})
      return
    }

    const address = state.sendAddress.fieldValue
    const amount = state.sendAmount.coins
    const hasDonation = state.donationAmount.fieldValue !== ''
    const donationAmount = state.donationAmount.coins
    const transactionFee = await wallet.getTxFee(address, amount, hasDonation, donationAmount)

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
        sendAmount: Object.assign({}, state.sendAmount, {
          validationError: feeValidator(amount, transactionFee, donationAmount, state.balance),
        }),
      })
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

  const calculatePercentageDonation = async () => {
    //TODO: remember fee, question about rounding
    const state = getState()
    const percentageDonation = state.sendAmount.fieldValue * 0.002
    const address = state.sendAddress.fieldValue
    const amount = state.sendAmount.coins
    const transactionFee = await wallet.getTxFee(address, amount, true, percentageDonation)

    if (amount + transactionFee + percentageDonation <= state.balance) {
      //affordable
      setState({
        percentageDonationValue: percentageDonation,
        percentageDonationText: '0.2%',
      })
      return
    }

    //exceeded balance, lower to 1%
    const percentageDonationHalf = percentageDonation / 2
    const transactionFeeHalfDonation = await wallet.getTxFee(
      //TODO: is this necessary?
      address,
      amount,
      true,
      percentageDonationHalf
    )

    if (amount + transactionFeeHalfDonation + percentageDonationHalf <= state.balance) {
      //afforable
      setState({
        percentageDonationValue: percentageDonationHalf,
        percentageDonationText: '0.1%',
      })
    }
  }

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

  const handleHighestAmountReached = () => {
    const state = getState()
    if (state.sendAmount.coins < 500000000) {
      //TODO: config
      return
    }

    setState({
      highestAmountReached: Math.max(state.sendAmount.coins, state.highestAmountReached),
    })
    calculatePercentageDonation()
  }

  const calculateMaxDonationAmount = async () => {
    const state = getState()
    const maxDonationAmount = await wallet.getMaxDonationAmount(
      state.sendAddress.fieldValue,
      state.sendAmount.coins
    )

    if (maxDonationAmount > 0) {
      setState({
        maxDonationAmount: sendAmountValidator(printAda(maxDonationAmount)).coins,
      })
    }
  }

  const updateAmount = (state, e) => {
    setState({
      sendResponse: '',
      sendAmount: Object.assign({}, state.sendAmount, {
        fieldValue: e.target.value,
      }),
    })
    validateSendFormAndCalculateFee()
    handleHighestAmountReached()
    calculateMaxDonationAmount()
  }

  const resetDonation = () => {
    setState({
      checkedDonationType: '',
      donationAmount: {fieldValue: ''},
    })
  }

  const sendMaxFunds = async (state) => {
    setState({calculatingFee: true})
    resetDonation()

    const maxSendAmount = await wallet.getMaxSendableAmount(state.sendAddress.fieldValue)
    const adaptedMaxAmount = sendAmountValidator(printAda(maxSendAmount))

    if (maxSendAmount > 0) {
      setState({
        sendResponse: '',
        sendAmount: adaptedMaxAmount,
        maxSendAmount: adaptedMaxAmount.coins,
        maxDonationAmount: 0,
      })
      validateSendFormAndCalculateFee()
    } else {
      setState({
        sendAmount: Object.assign({}, state.sendAmount, {
          validationError: {code: 'SendAmountCantSendMaxFunds'},
        }),
        calculatingFee: false,
      })
    }
  }

  // const sendMaxDonation = async (state) => {
  //   //TODO: perhaps refactor
  //   setState({calculatingFee: true})

  //   const maxDonationAmount = await wallet.getMaxDonationAmount(
  //     state.sendAddress.fieldValue,
  //     state.sendAmount.coins
  //   )

  //   if (maxDonationAmount > 0) {
  //     setState({
  //       donationAmount: sendAmountValidator(printAda(maxDonationAmount)),
  //     })
  //     validateSendFormAndCalculateFee()
  //   } else {
  //     setState({
  //       calculatingFee: false,
  //     })
  //   }
  // }

  const resetSendFormState = (state) => {
    setState({
      sendResponse: '',
      loading: false,
      showConfirmTransactionDialog: false,
      showTransactionErrorModal: false,
    })
  }

  const resetSendFormFields = (state) => {
    setState({
      sendAmount: {fieldValue: '', coins: 0},
      sendAddress: {fieldValue: ''},
      donationAmount: {fieldValue: ''},
      transactionFee: 0,
      maxSendAmount: Infinity,
      maxDonationAmount: Infinity,
      percentageDonationValue: '...',
      percentageDonationText: '0.2%',
      checkedDonationType: '',
      highestAmountReached: 0,
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
    setState({showConfirmTransactionDialog: false})
    if (state.usingHwWallet) {
      setState({waitingForHwWallet: true})
      loadingAction(state, `Waiting for ${state.hwWalletName}...`)
    } else {
      loadingAction(state, 'Submitting transaction...')
    }
    let sendResponse

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
      const txSubmitResult = await wallet.submitTx(signedTx)

      if (!txSubmitResult) {
        debugLog(txSubmitResult)
        throw NamedError('TransactionRejectedByNetwork')
      }

      sendResponse = await waitForTxToAppearOnBlockchain(state, txSubmitResult.txHash, 5000, 20)

      if (address === ADA_DONATION_ADDRESS || hasDonation) {
        setState({showThanksForDonation: true})
      }

      resetSendFormFields(state)
    } catch (e) {
      debugLog(e)
      sendResponse = {
        success: false,
        error: e.name,
        message: e.message,
      }
    } finally {
      resetSendFormState(state)
      setState({
        waitingForHwWallet: false,
        sendResponse,
        showTransactionErrorModal: !sendResponse.success,
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
        debugLog(e)
        throw NamedError('TransactionCorrupted')
      })

    setState({
      rawTransaction: Buffer.from(cbor.encode(txAux)).toString('hex'),
      rawTransactionOpen: true,
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
    showContactFormModal,
    closeContactFormModal,
    updateDonation,
    toggleCustomDonation,
  }
}
