import {ADALITE_CONFIG} from './config'
import {saveAs} from './libs/file-saver'
import {encode, decode} from 'borc'
import {
  parseCoins,
  sendAddressValidator,
  sendAmountValidator,
  txPlanValidator,
  delegationPlanValidator,
  withdrawalPlanValidator,
  mnemonicValidator,
  donationAmountValidator,
  poolIdValidator,
  validatePoolRegUnsignedTx,
} from './helpers/validators'
import printAda from './helpers/printAda'
import debugLog from './helpers/debugLog'
import getConversionRates from './helpers/getConversionRates'
import sleep from './helpers/sleep'
import {
  NETWORKS,
  PREMIUM_MEMBER_BALANCE_TRESHOLD,
  BIG_DELEGATOR_THRESHOLD,
} from './wallet/constants'
import NamedError from './helpers/NamedError'
import {exportWalletSecretDef} from './wallet/keypass-json'
import mnemonicToWalletSecretDef from './wallet/helpers/mnemonicToWalletSecretDef'
import sanitizeMnemonic from './helpers/sanitizeMnemonic'
import {initialState} from './store'
import {toCoins, toAda, roundWholeAdas} from './helpers/adaConverters'
import captureBySentry from './helpers/captureBySentry'
import {State, Ada, Lovelace, GetStateFn, SetStateFn, sourceAccountState} from './state'
import ShelleyCryptoProviderFactory from './wallet/shelley/shelley-crypto-provider-factory'
import {Wallet} from './wallet/wallet'
import {parseUnsignedTx} from './helpers/cliParser/parser'
import {TxPlan, unsignedPoolTxToTxPlan} from './wallet/shelley/shelley-transaction-planner'
import getDonationAddress from './helpers/getDonationAddress'
import {localStorageVars} from './localStorage'

let wallet: ReturnType<typeof Wallet>

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

export default ({setState, getState}: {setState: SetStateFn; getState: GetStateFn}) => {
  const loadingAction = (state, message: string, optionalArgsObj?: any) => {
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
  const setErrorState = (errorName: string, e: any, options?: any) => {
    if (e && e.name) {
      debugLog(e)
      captureBySentry(e)
      setState({
        [errorName]: {
          code: e.name,
          params: {
            message: e.message,
          },
        },
        error: e,
        ...options,
      })
    } else {
      setState({
        [errorName]: e,
        ...options,
      })
    }
  }

  const setAuthMethod = (state, option) => {
    setState({
      authMethod: option,
      shouldShowExportOption: option === 'mnemonic' || option === 'file',
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
    }
  }

  /* LOADING WALLET */

  const loadWallet = async (
    state: State,
    {cryptoProviderType, walletSecretDef, forceWebUsb, shouldExportPubKeyBulk}
  ) => {
    loadingAction(state, 'Loading wallet data...', {
      walletLoadingError: undefined,
    })
    const isShelleyCompatible = !(walletSecretDef && walletSecretDef.derivationScheme.type === 'v1')
    const config = {...ADALITE_CONFIG, isShelleyCompatible, shouldExportPubKeyBulk}
    try {
      const cryptoProvider = await ShelleyCryptoProviderFactory.getCryptoProvider(
        cryptoProviderType,
        {
          walletSecretDef,
          network: NETWORKS.SHELLEY[ADALITE_CONFIG.ADALITE_NETWORK],
          config,
          forceWebUsb, // TODO: into config
        }
      )

      wallet = await Wallet({
        config,
        cryptoProvider,
      })

      const {validStakepools} = await wallet.getValidStakepools()
      const {accountsInfo} = await wallet.getAccountsInfo(validStakepools)
      const {
        totalRewardsBalance,
        totalWalletBalance,
        shouldShowSaturatedBanner,
      } = wallet.getWalletInfo(accountsInfo)

      const conversionRatesPromise = getConversionRates(state)
      const usingHwWallet = wallet.isHwWallet()
      const hwWalletName = usingHwWallet ? wallet.getWalletName() : undefined
      const shouldNumberAccountsFromOne = hwWalletName === 'Trezor'
      if (usingHwWallet) loadingAction(state, `Waiting for ${hwWalletName}...`)
      const demoRootSecret = (await mnemonicToWalletSecretDef(
        ADALITE_CONFIG.ADALITE_DEMO_WALLET_MNEMONIC
      )).rootSecret
      const isDemoWallet = walletSecretDef && walletSecretDef.rootSecret.equals(demoRootSecret)
      const autoLogin = state.autoLogin
      const ticker2Id = null
      const shouldShowPremiumBanner =
        state.shouldShowPremiumBanner && PREMIUM_MEMBER_BALANCE_TRESHOLD < totalWalletBalance
      const isBigDelegator = totalWalletBalance > BIG_DELEGATOR_THRESHOLD
      setState({
        validStakepools,
        accountsInfo,
        totalWalletBalance,
        totalRewardsBalance,
        shouldShowSaturatedBanner,
        shouldNumberAccountsFromOne,
        walletIsLoaded: true,
        loading: false,
        mnemonicAuthForm: {
          mnemonicInputValue: '',
          mnemonicInputError: null,
          formIsValid: false,
        },
        usingHwWallet,
        hwWalletName,
        isDemoWallet,
        shouldShowDemoWalletWarningDialog: isDemoWallet && !autoLogin,
        shouldShowNonShelleyCompatibleDialog: !isShelleyCompatible,
        shouldShowGenerateMnemonicDialog: false,
        shouldShowAddressVerification: usingHwWallet,
        // send form
        sendAmount: {fieldValue: '', coins: 0},
        sendAddress: {fieldValue: ''},
        donationAmount: {fieldValue: '', coins: 0},
        sendResponse: '',
        // shelley
        ticker2Id,
        isShelleyCompatible,
        shouldShowPremiumBanner,
        isBigDelegator,
      })
      await fetchConversionRates(conversionRatesPromise)
    } catch (e) {
      setState({
        loading: false,
      })
      setErrorState('walletLoadingError', e)
      setState({
        shouldShowWalletLoadingErrorModal: true,
      })
      return false
    }
    return true
  }

  const reloadWalletInfo = async (state: State) => {
    loadingAction(state, 'Reloading wallet info...')
    try {
      const {accountsInfo} = await wallet.getAccountsInfo(state.validStakepools)
      const conversionRates = getConversionRates(state)

      // timeout setting loading state, so that loading shows even if everything was cached
      setTimeout(() => setState({loading: false}), 500)
      setState({
        accountsInfo,
        ...wallet.getWalletInfo(accountsInfo),
      })
      await fetchConversionRates(conversionRates)
    } catch (e) {
      setState({
        loading: false,
      })
      setErrorState('walletLoadingError', e)
      setState({
        shouldShowWalletLoadingErrorModal: true,
      })
    }
  }

  const loadDemoWallet = (state) => {
    setState({
      mnemonicAuthForm: {
        mnemonicInputValue: ADALITE_CONFIG.ADALITE_DEMO_WALLET_MNEMONIC,
        mnemonicInputError: null,
        formIsValid: true,
      },
      walletLoadingError: undefined,
      shouldShowWalletLoadingErrorModal: false,
      authMethod: 'mnemonic',
      shouldShowExportOption: true,
    })
  }

  const closeDemoWalletWarningDialog = (state) => {
    setState({
      shouldShowDemoWalletWarningDialog: false,
    })
  }

  const closeNonShelleyCompatibleDialog = (state) => {
    setState({
      shouldShowNonShelleyCompatibleDialog: false,
    })
  }

  const openNonShelleyCompatibleDialog = (state) => {
    setState({
      shouldShowNonShelleyCompatibleDialog: true,
    })
  }

  const closeWalletLoadingErrorModal = (state) => {
    setState({
      shouldShowWalletLoadingErrorModal: false,
    })
  }

  const logout = () => {
    wallet = null
    setState(
      {
        ...initialState,
        displayWelcome: false,
        autoLogin: false,
      },
      // @ts-ignore (we don't have types for forced state overwrite)
      true
    ) // force overwriting the state
    window.history.pushState({}, '/', '/')
  }

  /* MNEMONIC */

  const openGenerateMnemonicDialog = (state) => {
    setState({
      mnemonicAuthForm: {
        mnemonicInputValue: '',
        mnemonicInputError: null,
        formIsValid: false,
      },
      shouldShowGenerateMnemonicDialog: true,
      authMethod: 'mnemonic',
      shouldShowMnemonicInfoAlert: true,
    })
  }

  const closeGenerateMnemonicDialog = (state) => {
    setState({
      shouldShowGenerateMnemonicDialog: false,
    })
  }

  const updateMnemonic = (state: State, e) => {
    const mnemonicInputValue = e.target.value
    const sanitizedMnemonic = sanitizeMnemonic(mnemonicInputValue)
    const formIsValid = sanitizedMnemonic && mnemonicValidator(sanitizedMnemonic) === null

    setState({
      ...state,
      mnemonicAuthForm: {
        mnemonicInputValue,
        mnemonicInputError: null,
        formIsValid,
      },
    })
  }

  const updateMnemonicValidationError = (state: State) => {
    setState({
      ...state,
      mnemonicAuthForm: {
        ...state.mnemonicAuthForm,
        mnemonicInputError: mnemonicValidator(
          sanitizeMnemonic(state.mnemonicAuthForm.mnemonicInputValue)
        ),
      },
    })
  }

  /* ADDRESS DETAIL */

  const verifyAddress = async (state, address?) => {
    const newState = getState()
    if (newState.usingHwWallet) {
      try {
        setState({
          waitingForHwWallet: true,
          addressVerificationError: false,
        })
        await wallet
          .getAccount(state.targetAccountIndex)
          .verifyAddress(address || newState.showAddressDetail.address)
        setState({
          waitingForHwWallet: false,
        })
      } catch (e) {
        setState({
          waitingForHwWallet: false,
        })
        setErrorState('addressVerificationError', true)
      }
    }
  }

  const openAddressDetail = (state, {address, bip32path}, copyOnClick) => {
    /*
     * because we don't want to trigger trezor address
     * verification for the  donation address
     */
    const shouldShowAddressVerification = state.usingHwWallet && bip32path

    // trigger trezor address verification for the  donation address
    setState({
      showAddressDetail: {address, bip32path, copyOnClick},
      shouldShowAddressVerification,
    })
  }

  const closeAddressDetail = (state) => {
    setState({
      showAddressDetail: undefined,
      addressVerificationError: undefined,
    })
  }

  /* TRANSACTION */

  const confirmTransaction = async (state: State, txConfirmType) => {
    let txAux
    const newState = getState()
    try {
      if (newState.sendTransactionSummary.plan) {
        txAux = await wallet
          .getAccount(state.sourceAccountIndex)
          .prepareTxAux(newState.sendTransactionSummary.plan)
      } else {
        loadingAction(state, 'Preparing transaction plan...')
        await sleep(1000) // wait for plan to be set in case of unfortunate timing
        const retriedState = getState()
        txAux = await wallet
          .getAccount(state.sourceAccountIndex)
          .prepareTxAux(retriedState.sendTransactionSummary.plan)
      }
    } catch (e) {
      throw NamedError('TransactionCorrupted', {causedBy: e})
    } finally {
      stopLoadingAction(state, {})
    }

    // TODO: implement tx differenciation here and drop the txConfirmType

    const isTxBetweenAccounts = state.selectedMainTab === 'Accounts' && txConfirmType === 'send'
    // TODO: refactor
    const keepConfirmationDialogOpen =
      isTxBetweenAccounts || txConfirmType === 'convert' || txConfirmType === 'withdraw'

    setState({
      shouldShowConfirmTransactionDialog: true,
      txConfirmType: isTxBetweenAccounts ? 'crossAccount' : txConfirmType,
      keepConfirmationDialogOpen,
      // TODO: maybe do this only on demand
      rawTransaction: Buffer.from(encode(txAux)).toString('hex'),
      rawTransactionOpen: false,
    })
  }

  const closeConfirmationDialog = (state) => {
    setState({
      keepConfirmationDialogOpen: false,
      shouldShowConfirmTransactionDialog: false,
    })
  }

  const cancelTransaction = () => ({
    shouldShowConfirmTransactionDialog: false,
    shouldShowSendTransactionModal: false,
    shouldShowDelegationModal: false,
  })

  const setRawTransactionOpen = (state, open) => {
    setState({
      rawTransactionOpen: open,
    })
  }

  const closeTransactionErrorModal = (state) => {
    setState({
      shouldShowTransactionErrorModal: false,
    })
  }

  /* SEND ADA */

  const setTransactionSummary = (tab, plan, coins?, donationAmount?) => {
    setState({
      sendTransactionSummary: {
        amount: coins || 0,
        donation: donationAmount || 0,
        fee: plan.fee != null ? plan.fee : plan.estimatedFee,
        plan: plan.fee != null ? plan : null,
        tab,
        deposit: plan.deposit,
      },
    })
  }

  const resetTransactionSummary = (state) => {
    setState({
      sendTransactionSummary: {
        amount: 0 as Lovelace,
        fee: 0 as Lovelace,
        donation: 0 as Lovelace,
        plan: null,
        tab: state.sendTransactionSummary.tab,
        deposit: 0,
      },
    })
  }

  const resetPercentageDonation = () => {
    setState({
      isThresholdAmountReached: false,
      percentageDonationValue: 0,
      percentageDonationText: '0.2%',
    })
  }

  const resetAmountFields = (state) => {
    setState({
      donationAmount: {fieldValue: '', coins: 0},
      transactionFee: 0, // TODO(merc): call resetDonation instead?
      maxDonationAmount: Infinity,
      checkedDonationType: '',
      shouldShowCustomDonationInput: false,
    })
    resetPercentageDonation()
  }

  const resetSendFormState = (state) => {
    setState({
      sendResponse: '',
      loading: false,
      shouldShowConfirmTransactionDialog: false,
    })
  }

  const resetSendFormFields = (state) => {
    setState({
      sendAmount: {fieldValue: '', coins: 0},
      sendAddress: {fieldValue: ''},
      sendAddressValidationError: null,
      sendAmountValidationError: null,
    })
    resetAmountFields(state)
  }

  const resetDonation = () => {
    setState({
      checkedDonationType: '',
      donationAmount: {fieldValue: '', coins: 0},
    })
  }

  const resetDelegation = () => {
    setState({
      shelleyDelegation: {
        delegationFee: 0,
        selectedPool: {
          poolHash: '',
        },
      },
    })
  }

  const validateSendForm = (state) => {
    setErrorState('sendAddressValidationError', sendAddressValidator(state.sendAddress.fieldValue))
    setErrorState(
      'sendAmountValidationError',
      sendAmountValidator(
        state.sendAmount.fieldValue,
        state.sendAmount.coins,
        sourceAccountState(state).balance
      )
    )
    setErrorState(
      'donationAmountValidationError',
      donationAmountValidator(
        state.donationAmount.fieldValue,
        state.donationAmount.coins,
        sourceAccountState(state).balance
      )
    )
  }

  const resetDelegationWithoutHash = (state) => {
    const newState = getState()
    setState({
      shelleyDelegation: {
        ...state.shelleyDelegation,
        selectedPool: {
          ...newState.shelleyDelegation.selectedPool,
        },
        delegationFee: 0,
      },
    })
  }

  const isSendFormFilledAndValid = (state) =>
    state.sendAddress.fieldValue !== '' &&
    state.sendAmount.fieldValue !== '' &&
    !state.sendAddressValidationError &&
    !state.sendAmountValidationError &&
    !state.donationAmountValidationError

  const prepareTxPlan = async (args) => {
    const state = getState()
    const plan: any = await wallet.getAccount(state.sourceAccountIndex).getTxPlan(args)
    // FIXME: this cant be any
    if (plan.error) {
      stopLoadingAction(state, {})
      resetDelegationWithoutHash(state)
      setState({
        calculatingDelegationFee: false,
        calculatingFee: false,
      })
    }
    return plan
  }

  const calculateFee = async () => {
    const state = getState()
    if (!isSendFormFilledAndValid(state)) {
      setState({
        calculatingFee: false,
        transactionFee: 0,
      })
      return
    }
    const coins = state.sendAmount.coins as Lovelace
    const donationAmount = state.donationAmount.coins as Lovelace
    const address = state.sendAddress.fieldValue
    const plan = await prepareTxPlan({address, coins, donationAmount, txType: 'sendAda'})
    const newState = getState() // if the values changed meanwhile
    if (
      newState.sendAmount.fieldValue !== state.sendAmount.fieldValue ||
      newState.sendAddress.fieldValue !== state.sendAddress.fieldValue ||
      newState.donationAmount.fieldValue !== state.donationAmount.fieldValue
    ) {
      return
    }
    const validationError = txPlanValidator(
      coins,
      sourceAccountState(state).balance, // TODO: get new balance
      plan,
      donationAmount
    )
    setErrorState('sendAmountValidationError', validationError)
    if (!validationError) {
      setTransactionSummary('send', plan, coins, donationAmount)
    }
    setState({
      calculatingFee: false,
      txSuccessTab: '',
      transactionFee: plan.fee || 0,
    })
  }

  const isSendAmountNonPositive = (fieldValue, validationError) =>
    fieldValue === '' ||
    (validationError &&
      (validationError.code === 'SendAmountIsNotPositive' ||
        validationError.code === 'SendAmountIsNan'))

  const debouncedCalculateFee = debounceEvent(calculateFee, 2000)

  const validateSendFormAndCalculateFee = () => {
    validateSendForm(getState())
    resetTransactionSummary(getState())
    setState({transactionFee: 0})
    const state = getState()
    if (isSendFormFilledAndValid(state)) {
      setState({calculatingFee: true})
      debouncedCalculateFee()
    } else {
      if (isSendAmountNonPositive(state.sendAmount.fieldValue, state.sendAmountValidationError)) {
        resetAmountFields(state)
      }
      setState({calculatingFee: false})
    }
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

  const getPercentageDonationProperties = () => {
    const state = getState()
    const amount = state.sendAmount.coins
    const preferredDonation: Lovelace = roundWholeAdas((amount * 0.002) as Lovelace) as Lovelace

    return preferredDonation <= state.maxDonationAmount
      ? {
        text: '0.2%',
        value: toAda(preferredDonation),
      }
      : {
        text: '0.1%', // exceeded balance, lower to 1% or MIN
        value: Math.max(
          Math.round(toAda((preferredDonation / 2) as Lovelace)),
          ADALITE_CONFIG.ADALITE_MIN_DONATION_VALUE
        ) as Ada,
      }
  }

  const getProperTextAndVal = async (coins) => {
    if (coins < toCoins((500 * ADALITE_CONFIG.ADALITE_MIN_DONATION_VALUE) as Ada)) {
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
        isThresholdAmountReached: true,
      })
    } else {
      // disable and reset %-button because sendAmount is too low
      resetPercentageDonation()
    }
  }

  const calculateMaxDonationAmount = async () => {
    const state = getState()
    await wallet
      .getAccount(state.sourceAccountIndex)
      .getMaxDonationAmount(state.sendAddress.fieldValue, state.sendAmount.coins as Lovelace)
      .then((maxDonationAmount) => {
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
      })
      .catch((e) => {
        resetDonation()
        resetAmountFields(state)
        setErrorState('sendAmountValidationError', {code: e.name})
      })
  }

  const updateAddress = (state, e, address?: string) => {
    setState({
      sendResponse: '',
      sendAddress: Object.assign({}, state.sendAddress, {
        fieldValue: address || e.target.value,
      }),
    })
    validateSendFormAndCalculateFee()
  }

  const updateAmount = async (state, e) => {
    setState({
      sendResponse: '',
      sendAmount: Object.assign({}, state.sendAmount, {
        fieldValue: e.target.value,
        coins: parseCoins(e.target.value) || 0,
      }),
    })

    validateSendFormAndCalculateFee()
    if (isSendFormFilledAndValid(getState())) {
      await calculateMaxDonationAmount()
      handleThresholdAmount()
    }
  }

  const validateAndSetMaxFunds = (state, maxAmounts) => {
    /* maxAmounts.donationAmount exists only if user triggers
      this function with percentage donation selected */

    setState({
      sendResponse: '',
      sendAmount: {
        fieldValue: printAda(maxAmounts.sendAmount),
        coins: maxAmounts.sendAmount || null,
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
          coins: maxAmounts.donationAmount || null,
        },
      })
    }
    validateSendFormAndCalculateFee()
  }

  const sendMaxFunds = async (state) => {
    setState({calculatingFee: true})
    await wallet
      .getAccount(state.sourceAccountIndex)
      .getMaxSendableAmount(
        state.sendAddress.fieldValue,
        state.donationAmount.fieldValue !== '',
        state.donationAmount.coins,
        state.checkedDonationType
      )
      .then((maxAmounts) => {
        validateAndSetMaxFunds(state, maxAmounts)
      })
      .catch((e) => {
        setState({
          calculatingFee: false,
        })
        setErrorState('sendAmountValidationError', {code: e.name})
        return
      })
  }

  const convertNonStakingUtxos = async (state) => {
    loadingAction(state, 'Preparing transaction...')
    const address = await wallet.getAccount(state.sourceAccountIndex).getChangeAddress()
    const maxAmount = await wallet
      .getAccount(state.sourceAccountIndex)
      .getMaxNonStakingAmount(address)
    const coins = maxAmount && maxAmount.sendAmount
    const plan = await prepareTxPlan({address, coins, txType: 'convert'})
    const validationError = txPlanValidator(coins, sourceAccountState(state).balance, plan)
    if (validationError) {
      setErrorState('transactionSubmissionError', validationError, {
        shouldShowTransactionErrorModal: true,
      })
      stopLoadingAction(state, {})
      return
    }
    setTransactionSummary('stake', plan, coins)
    await confirmTransaction(getState(), 'convert')
    stopLoadingAction(state, {})
  }

  const withdrawRewards = async (state) => {
    loadingAction(state, 'Preparing transaction...')
    // TODO: get reward and normal balance from be not from state
    const rewards = sourceAccountState(state).shelleyBalances.rewardsAccountBalance
    const plan = await prepareTxPlan({rewards, txType: 'withdraw'})
    const withdrawalValidationError =
      withdrawalPlanValidator(rewards, sourceAccountState(state).balance, plan) ||
      wallet.checkCryptoProviderVersion('WITHDRAWAL')
    if (withdrawalValidationError) {
      setErrorState('transactionSubmissionError', withdrawalValidationError, {
        shouldShowTransactionErrorModal: true,
      })
      stopLoadingAction(state, {})
      return
    }
    setTransactionSummary('stake', plan, rewards)
    await confirmTransaction(getState(), 'withdraw')
    stopLoadingAction(state, {})
  }

  const updateDonation = (state, e) => {
    if (state.checkedDonationType === e.target.id && e.target.id !== 'custom') {
      // when clicking already selected button
      resetDonation()
    } else {
      setState({
        donationAmount: {
          fieldValue: e.target.value,
          coins: parseCoins(e.target.value) || 0,
        },
        checkedDonationType: e.target.id,
      })
    }
    validateSendFormAndCalculateFee()
  }

  const toggleCustomDonation = (state) => {
    resetDonation()
    setState({
      shouldShowCustomDonationInput: !state.shouldShowCustomDonationInput,
    })
    validateSendFormAndCalculateFee()
  }

  const closeThanksForDonationModal = (state) => {
    setState({
      shouldShowThanksForDonation: false,
    })
  }

  /* DELEGATE */

  const hasPoolIdentifiersChanged = (state) => {
    const {shelleyDelegation: newShelleyDelegation} = getState()
    return (
      newShelleyDelegation.selectedPool.poolHash !== state.shelleyDelegation.selectedPool.poolHash
    )
    // maybe also check if tab changed
  }

  const setPoolInfo = async (state) => {
    if (hasPoolIdentifiersChanged(state)) {
      return
    }
    const poolInfo = await wallet
      .getAccount(state.sourceAccountIndex)
      .getPoolInfo(state.shelleyDelegation.selectedPool.url)
    if (hasPoolIdentifiersChanged(state)) {
      return
    }
    const newState = getState()
    setState({
      shelleyDelegation: {
        ...state.shelleyDelation,
        selectedPool: {
          ...state.shelleyDelegation.selectedPool,
          ...poolInfo,
        },
        delegationFee: newState.shelleyDelegation.delegationFee,
      },
      gettingPoolInfo: false,
    })
  }

  const calculateDelegationFee = async () => {
    const state = getState()
    setPoolInfo(state)
    const poolHash = state.shelleyDelegation.selectedPool.poolHash
    const stakingKeyRegistered = sourceAccountState(state).shelleyAccountInfo.hasStakingKey
    const plan = await prepareTxPlan({poolHash, stakingKeyRegistered, txType: 'delegate'})
    const newState = getState()
    if (hasPoolIdentifiersChanged(newState)) {
      return
    }
    const validationError = delegationPlanValidator(sourceAccountState(state).balance, plan)
    if (validationError) {
      setErrorState('delegationValidationError', validationError, {
        calculatingDelegationFee: false,
      })
      return
    }
    setState({
      shelleyDelegation: {
        ...newState.shelleyDelegation,
        delegationFee: plan.fee + (plan.deposit || 0),
      },
    })
    setTransactionSummary('stake', plan)
    setState({
      calculatingDelegationFee: false,
      txSuccessTab: newState.txSuccessTab === 'send' ? newState.txSuccessTab : '',
    })
  }

  const debouncedCalculateDelegationFee = debounceEvent(calculateDelegationFee, 500)

  const validateDelegationAndCalculateFee = () => {
    const state = getState()
    const selectedPool = state.shelleyDelegation.selectedPool
    const delegationValidationError = selectedPool.validationError || selectedPool.poolHash === ''

    setErrorState('delegationValidationError', delegationValidationError)
    setState({
      delegationValidationError,
    })
    if (!delegationValidationError) {
      setState({
        calculatingDelegationFee: true,
        gettingPoolInfo: true,
      })
      debouncedCalculateDelegationFee()
    } else {
      setState({
        shelleyDelegation: {
          ...state.shelleyDelegation,
          delegationFee: 0,
        },
      })
    }
  }

  const updateStakePoolIdentifier = (state, e, hash?) => {
    /**
     * this has to be redone,
     * pool validation must happen before debouncing
     * but pool info shown after
     */
    const poolHash = hash || e.target.value
    const validationError = poolIdValidator(poolHash, state.validStakepools)
    setState({
      shelleyDelegation: {
        ...state.shelleyDelegation,
        selectedPool: {
          validationError,
          ...state.validStakepools[poolHash],
          poolHash,
        },
      },
    })
    if (validationError || poolHash === '') {
      if (poolHash === '') {
        resetDelegation()
        setState({
          delegationValidationError: null,
        })
      }
      return
    }
    validateDelegationAndCalculateFee()
  }

  const selectAdaliteStakepool = (state: State) => {
    const newState = getState()
    updateStakePoolIdentifier(
      newState,
      null,
      sourceAccountState(newState).poolRecommendation.recommendedPoolHash
    )
  }

  /* MULTIPLE ACCOUNTS */

  const resetAccountIndexes = (state: State) => {
    setState({
      targetAccountIndex: state.activeAccountIndex,
      sourceAccountIndex: state.activeAccountIndex,
    })
  }
  const setActiveAccount = (state: State, accountIndex: number) => {
    setState({
      activeAccountIndex: accountIndex,
      targetAccountIndex: accountIndex,
      sourceAccountIndex: accountIndex,
      txSuccessTab: '',
    })
  }

  const exploreNewAccount = async (state: State) => {
    try {
      loadingAction(state, 'Loading account')
      const newAccount = await wallet.exploreNewAccount()
      const accountInfo = await newAccount.getAccountInfo(state.validStakepools)
      const accountsInfo = [...state.accountsInfo, accountInfo]
      setState({
        accountsInfo,
        ...wallet.getWalletInfo(accountsInfo),
      })
      setActiveAccount(state, newAccount.accountIndex)
    } catch (e) {
      setErrorState('walletLoadingError', e)
      setState({
        shouldShowWalletLoadingErrorModal: true,
      })
    } finally {
      stopLoadingAction(state, {})
    }
  }

  const setTargetAccount = async (state: State, accountIndex: number) => {
    setState({
      targetAccountIndex: accountIndex,
    })
    const targetAddress = await wallet.getAccount(accountIndex).getChangeAddress()
    updateAddress(state, null, targetAddress)
  }

  const setSourceAccount = async (state: State, accountIndex: number) => {
    resetTransactionSummary(state)
    setState({
      sourceAccountIndex: accountIndex,
    })
    const targetAddress = await wallet.getAccount(getState().targetAccountIndex).getChangeAddress()
    updateAddress(state, null, targetAddress)
  }

  const showSendTransactionModal = async (
    state: State,
    sourceAccountIndex: number,
    targetAccountIndex: number
  ) => {
    resetTransactionSummary(state)
    setState({
      sourceAccountIndex,
      targetAccountIndex,
      sendTransactionTitle: 'Transfer funds between accounts',
      shouldShowSendTransactionModal: true,
      txSuccessTab: '',
      sendAmount: {fieldValue: '', coins: 0},
      transactionFee: 0,
    })
    const targetAddress = await wallet.getAccount(targetAccountIndex).getChangeAddress()
    updateAddress(getState(), null, targetAddress)
  }

  const closeSendTransactionModal = (state: State) => {
    resetTransactionSummary(state)
    resetAccountIndexes(state)
    setState({
      sendAddress: {fieldValue: ''},
      sendAmount: {fieldValue: '', coins: 0},
      transactionFee: 0,
      shouldShowSendTransactionModal: false,
      sendAddressValidationError: null,
      sendAmountValidationError: null,
    })
  }

  const switchSourceAndTargetAccounts = async (state: State) => {
    const targetAccountIndex = state.sourceAccountIndex
    const sourceAccountIndex = state.targetAccountIndex
    resetTransactionSummary(state)
    setState({
      sourceAccountIndex,
      targetAccountIndex,
    })
    const targetAddress = await wallet.getAccount(targetAccountIndex).getChangeAddress()
    updateAddress(state, null, targetAddress)
  }

  const showDelegationModal = (state: State, sourceAccountIndex: number) => {
    setState({
      sourceAccountIndex,
      // TODO: move this title logic to the actual component
      delegationTitle: state.shouldNumberAccountsFromOne
        ? `Delegate Account #${sourceAccountIndex + 1} Stake`
        : `Delegate Account ${sourceAccountIndex} Stake`,
      shouldShowDelegationModal: true,
      txSuccessTab: '',
    })
    selectAdaliteStakepool(state)
  }

  const closeDelegationModal = (state: State) => {
    resetDelegation()
    resetAccountIndexes(state)
    setState({
      shouldShowDelegationModal: false,
    })
  }

  /* SUBMIT TX */

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
        return {
          success: true,
          txHash,
        }
      } else if (pollingCounter < maxRetries - 1) {
        if (pollingCounter === 21) {
          loadingAction(state, 'Syncing wallet - this might take a while...')
        }
        await sleep(pollingInterval)
      }
    }
    throw NamedError('TransactionNotFoundInBlockchainAfterSubmission')
  }

  const submitTransaction = async (state) => {
    setState({
      shouldShowSendTransactionModal: false,
      shouldShowDelegationModal: false,
    })
    if (!state.keepConfirmationDialogOpen) {
      setState({
        shouldShowConfirmTransactionDialog: false,
      })
    }
    if (state.usingHwWallet) {
      setState({waitingForHwWallet: true})
      loadingAction(state, `Waiting for ${state.hwWalletName}...`)
    } else {
      loadingAction(state, 'Submitting transaction...')
    }
    let sendResponse
    let txSubmitResult
    const txTab = state.sendTransactionSummary.tab
    try {
      const txAux = await wallet
        .getAccount(state.sourceAccountIndex)
        .prepareTxAux(state.sendTransactionSummary.plan)
      const signedTx = await wallet.getAccount(state.sourceAccountIndex).signTxAux(txAux)

      if (state.usingHwWallet) {
        setState({waitingForHwWallet: false})
        loadingAction(state, 'Submitting transaction...')
      }
      txSubmitResult = await wallet.submitTx(signedTx)

      if (!txSubmitResult) {
        // TODO: this seems useless here
        throw NamedError('TransactionRejectedByNetwork')
      }

      sendResponse = await waitForTxToAppearOnBlockchain(state, txSubmitResult.txHash, 5000, 40)

      const address = state.sendAddress.fieldValue
      const donationAmount = state.donationAmount.coins
      const didDonate = address === getDonationAddress() || donationAmount > 0
      closeConfirmationDialog(state)
      if (didDonate) {
        setState({shouldShowThanksForDonation: true})
      }
    } catch (e) {
      setErrorState('transactionSubmissionError', e, {
        txHash: txSubmitResult && txSubmitResult.txHash,
      })
      setState({
        shouldShowTransactionErrorModal: true,
      })
    } finally {
      closeConfirmationDialog(state)
      resetTransactionSummary(state)
      resetSendFormFields(state)
      resetSendFormState(state)
      resetAmountFields(state)
      await reloadWalletInfo(state)
      wallet.getAccount(state.sourceAccountIndex).generateNewSeeds()
      resetAccountIndexes(state)
      selectAdaliteStakepool(state)
      setState({
        waitingForHwWallet: false,
        txSuccessTab: sendResponse && sendResponse.success ? txTab : '',
        sendResponse,
      })
    }
  }

  /* EXPORT WALLET */

  const exportJsonWallet = async (state, password, walletName) => {
    const walletExport = JSON.stringify(
      await exportWalletSecretDef(wallet.getWalletSecretDef(), password, walletName)
    )

    const blob = new Blob([walletExport], {
      type: 'application/json;charset=utf-8',
    })
    saveAs(blob, `${walletName}.json`)
  }

  /* GENERAL */

  const openWelcome = (state) => {
    setState({
      displayWelcome: true,
    })
  }

  const closeWelcome = (state, dontShowDisclaimer) => {
    // we may get an ignored click event as the second argument, check only against booleans
    window.localStorage.setItem(localStorageVars.WELCOME, dontShowDisclaimer)
    setState({
      displayWelcome: false,
    })
  }

  const openInfoModal = (state) => {
    setState({
      displayInfoModal: true,
    })
  }

  const closeInfoModal = (state, dontShowInfoModal) => {
    // we may get an ignored click event as the second argument, check only against booleans
    window.localStorage.setItem(localStorageVars.INFO_MODAL, dontShowInfoModal)
    setState({
      displayInfoModal: false,
    })
  }

  const closeStakingBanner = (state) => {
    window.localStorage.setItem(localStorageVars.STAKING_BANNER, 'true')
    setState({
      shouldShowStakingBanner: false,
    })
  }

  const closePremiumBanner = (state) => {
    window.localStorage.setItem(localStorageVars.PREMIUM_BANNER, 'true')
    setState({
      shouldShowPremiumBanner: false,
    })
  }

  const shouldShowContactFormModal = (state) => {
    setState({
      shouldShowContactFormModal: true,
    })
  }

  const closeContactFormModal = (state) => {
    setState({
      shouldShowContactFormModal: false,
    })
  }

  const setLogoutNotificationOpen = (state, open) => {
    setState({
      logoutNotificationOpen: open,
    })
  }

  const selectMainTab = (state: State, value) => {
    resetAccountIndexes(state)
    setState({selectedMainTab: value})
    resetTransactionSummary(state)
    resetSendFormFields(state)
  }

  const closeUnexpectedErrorModal = (state) => {
    setState({
      shouldShowUnexpectedErrorModal: false,
    })
  }
  const loadErrorBannerContent = (state) => {
    const errorBannerContent = ADALITE_CONFIG.ADALITE_ERROR_BANNER_CONTENT
    const shouldShowErrorBanner = !!errorBannerContent
    setState({
      errorBannerContent,
      shouldShowStakingBanner: shouldShowErrorBanner ? false : state.shouldShowStakingBanner,
    })
  }

  /* Pool Owner */

  const deserializeTransactionFile = (file) => {
    if (!file || file.type !== 'TxUnsignedShelley' || !file.cborHex) {
      throw NamedError('PoolRegInvalidFileFormat')
    }

    const unsignedTxDecoded = decode(file.cborHex)
    const parsedTx = parseUnsignedTx(unsignedTxDecoded)
    return parsedTx
  }

  const loadPoolCertificateTx = async (state: State, fileObj) => {
    try {
      if (!state.usingHwWallet) {
        throw NamedError('PoolRegNoHwWallet')
      }
      loadingAction(state, 'Loading pool registration certificate...', {
        poolRegTxError: undefined,
      })
      const fileJson = await JSON.parse(fileObj)
      const deserializedTx = deserializeTransactionFile(fileJson)
      const deserializedTxValidationError = validatePoolRegUnsignedTx(deserializedTx)
      if (deserializedTxValidationError) {
        throw deserializedTxValidationError
      }
      const ownerCredentials = await wallet
        .getAccount(state.sourceAccountIndex)
        .getPoolOwnerCredentials()
      const poolTxPlan: TxPlan = unsignedPoolTxToTxPlan(deserializedTx, ownerCredentials)
      setState({
        poolCertTxVars: {
          shouldShowPoolCertSignModal: false,
          ttl: deserializedTx.ttl,
          signature: null,
          plan: poolTxPlan,
        },
      })
    } catch (err) {
      // err from parser
      if (err.name === 'Error') {
        err.name = 'PoolRegTxParserError'
      }
      debugLog(`Certificate file parsing failure: ${err}`)
      setErrorState('poolRegTxError', err)
    } finally {
      stopLoadingAction(state, {})
    }
  }

  const openPoolCertificateTxModal = (state) => {
    setState({
      poolCertTxVars: {
        ...state.poolCertTxVars,
        shouldShowPoolCertSignModal: true,
      },
    })
  }

  const closePoolCertificateTxModal = (state) => {
    setState({
      poolCertTxVars: {
        ...state.poolCertTxVars,
        shouldShowPoolCertSignModal: false,
      },
    })
  }

  const resetPoolCertificateTxVars = (state) => {
    setState({
      poolCertTxVars: {
        shouldShowPoolCertSignModal: false,
        ttl: 0,
        signature: null,
        plan: null,
      },
      poolRegTxError: undefined,
    })
  }

  const signPoolCertificateTx = async (state) => {
    try {
      if (state.usingHwWallet) {
        setState({waitingForHwWallet: true})
        loadingAction(state, `Waiting for ${state.hwWalletName}...`)
      } else {
        throw NamedError('PoolRegNoHwWallet')
      }

      const txAux = await wallet.getAccount(state.sourceAccountIndex).prepareTxAux(
        state.poolCertTxVars.plan, // @ts-ignore (Fix byron-shelley formats later)
        parseInt(state.poolCertTxVars.ttl, 10)
      )
      const signature = await wallet.getAccount(state.sourceAccountIndex).signTxAux(txAux)

      setState({
        poolCertTxVars: {
          ...state.poolCertTxVars,
          shouldShowPoolCertSignModal: false,
          signature,
        },
      })
    } catch (e) {
      debugLog(`Certificate transaction file signing failure: ${e}`)
      resetPoolCertificateTxVars(state)
      setErrorState('poolRegTxError', e)
    } finally {
      stopLoadingAction(state, {})
    }
  }

  // TODO: move these below somewhere else since it has nothing to do with state

  // vacuumlabs/cardano-hw-cli
  const transformSignatureToCliFormat = (signedTxCborHex) => {
    const [, witnesses] = decode(signedTxCborHex)
    // there can be only one witness since only one signing file was passed
    const [key, [data]]: any = Array.from(witnesses)[0]
    // enum TxWitnessKeys
    const type = key === 0 ? 'TxWitnessShelley' : 'TxWitnessByron'
    return {
      type,
      description: '',
      cborHex: encode([key, data]).toString('hex'),
    }
  }

  const downloadPoolSignature = (state) => {
    const cliFormatWitness = transformSignatureToCliFormat(state.poolCertTxVars.signature.txBody)
    const signatureExport = JSON.stringify(cliFormatWitness)
    const blob = new Blob([signatureExport], {
      type: 'application/json;charset=utf-8',
    })
    saveAs(blob, 'PoolSignature.json')
    resetPoolCertificateTxVars(state)
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
    updateMnemonicValidationError,
    openAddressDetail,
    closeAddressDetail,
    verifyAddress,
    sendMaxFunds,
    openGenerateMnemonicDialog,
    closeGenerateMnemonicDialog,
    closeDemoWalletWarningDialog,
    closeNonShelleyCompatibleDialog,
    openNonShelleyCompatibleDialog,
    closeThanksForDonationModal,
    setLogoutNotificationOpen,
    setRawTransactionOpen,
    closeTransactionErrorModal,
    closeWalletLoadingErrorModal,
    closeUnexpectedErrorModal,
    shouldShowContactFormModal,
    closeContactFormModal,
    updateDonation,
    toggleCustomDonation,
    setDonation,
    resetDonation,
    closeStakingBanner,
    updateStakePoolIdentifier,
    selectMainTab,
    selectAdaliteStakepool,
    convertNonStakingUtxos,
    loadErrorBannerContent,
    withdrawRewards,
    openInfoModal,
    closeInfoModal,
    closePremiumBanner,
    showSendTransactionModal,
    closeSendTransactionModal,
    showDelegationModal,
    closeDelegationModal,
    setActiveAccount,
    setTargetAccount,
    setSourceAccount,
    exploreNewAccount,
    switchSourceAndTargetAccounts,
    loadPoolCertificateTx,
    downloadPoolSignature,
    openPoolCertificateTxModal,
    closePoolCertificateTxModal,
    signPoolCertificateTx,
  }
}
