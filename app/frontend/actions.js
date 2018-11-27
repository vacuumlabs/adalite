const {generateMnemonic} = require('./wallet/mnemonic')
const {ADALITE_CONFIG} = require('./config')
const derivationSchemes = require('./wallet/derivation-schemes')
const FileSaver = require('file-saver')
const cbor = require('cbor')
const {
  sendAddressValidator,
  sendAmountValidator,
  feeValidator,
  mnemonicValidator,
} = require('./helpers/validators')
const printAda = require('./helpers/printAda')
const debugLog = require('./helpers/debugLog')
const getConversionRates = require('./helpers/getConversionRates')
const sleep = require('./helpers/sleep')
const {ADA_DONATION_ADDRESS} = require('./wallet/constants')
const NamedError = require('./helpers/NamedError')
const Cardano = require('./wallet/cardano-wallet')
const KeypassJson = require('./wallet/keypass-json')

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
        wallet = await Cardano.CardanoWallet({
          cryptoProvider: 'trezor',
          config: ADALITE_CONFIG,
          network: 'mainnet',
          derivationScheme: derivationSchemes.v2,
        })
        break
      case 'mnemonic':
        secret = secret.trim()
        wallet = await Cardano.CardanoWallet({
          cryptoProvider: 'mnemonic',
          mnemonicOrHdNodeString: secret,
          config: ADALITE_CONFIG,
          network: 'mainnet',
          derivationScheme: derivationSchemes.v1,
        })
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
      const ownAddressesWithMeta = await wallet.getVisibleAddressesWithMeta()
      const transactionHistory = await wallet.getHistory()
      const balance = await wallet.getBalance()
      const conversionRates = getConversionRates(state)
      const sendAmount = {fieldValue: ''}
      const sendAddress = {fieldValue: ''}
      const sendResponse = ''
      const usingTrezor = cryptoProvider === 'trezor'
      const isDemoWallet = secret === ADALITE_CONFIG.ADALITE_DEMO_WALLET_MNEMONIC
      setState({
        walletIsLoaded,
        ownAddressesWithMeta,
        balance,
        sendAmount,
        sendAddress,
        sendResponse,
        transactionHistory,
        loading: false,
        mnemonic: '',
        usingTrezor,
        isDemoWallet,
        showDemoWalletWarningDialog: isDemoWallet,
        showGenerateMnemonicDialog: false,
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
      setState({
        walletLoadingError: {
          code: 'WalletInitializationError',
        },
        loading: false,
      })
    }
    return true
  }

  const loadDemoWallet = (state) => {
    setState({
      mnemonic: ADALITE_CONFIG.ADALITE_DEMO_WALLET_MNEMONIC,
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
        await wallet.verifyAddress(state.showAddressDetail.address)
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
    const ownAddressesWithMeta = await wallet.getVisibleAddressesWithMeta()
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
      sendAddress: sendAddressValidator(state.sendAddress.fieldValue),
      sendAmount: sendAmountValidator(state.sendAmount.fieldValue),
    })
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

  const sendMaxFunds = async (state) => {
    setState({calculatingFee: true})

    const maxAmount = await wallet.getMaxSendableAmount(state.sendAddress.fieldValue)

    if (maxAmount > 0) {
      setState({
        sendResponse: '',
        sendAmount: sendAmountValidator(printAda(maxAmount)),
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

  const resetSendForm = (state) => {
    setState({
      sendAmount: {fieldValue: ''},
      sendAddress: {fieldValue: ''},
      sendResponse: '',
      transactionFee: 0,
      loading: false,
      showConfirmTransactionDialog: false,
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
    if (state.usingTrezor) {
      setState({waitingForTrezor: true})
    } else {
      loadingAction(state, 'Submitting transaction...')
    }

    let sendResponse

    try {
      const address = state.sendAddress.fieldValue
      const amount = state.sendAmount.coins
      const signedTx = await wallet.prepareSignedTx(address, amount)
      if (state.usingTrezor) {
        setState({waitingForTrezor: false})
        loadingAction(state, 'Submitting transaction...')
      }
      const txSubmitResult = await wallet.submitTx(signedTx)

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
        waitingForTrezor: false,
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
    const walletExport = JSON.stringify(
      await KeypassJson.exportWalletSecret(wallet.getSecret(), password, walletName)
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
      debugLog(e)
      throw NamedError('TransactionCorrupted')
    })

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
    setLogoutNotificationOpen,
    setRawTransactionOpen,
    getRawTransaction,
  }
}
