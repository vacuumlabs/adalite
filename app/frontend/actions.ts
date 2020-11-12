import {ADALITE_CONFIG} from './config'
import {saveAs} from './libs/file-saver'
import {encode} from 'borc'
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
} from './helpers/validators'
import printAda from './helpers/printAda'
import debugLog from './helpers/debugLog'
import getConversionRates from './helpers/getConversionRates'
import sleep from './helpers/sleep'
import {NETWORKS} from './wallet/constants'
import NamedError from './helpers/NamedError'
import {exportWalletSecretDef} from './wallet/keypass-json'
import {CardanoWallet} from './wallet/cardano-wallet'
import mnemonicToWalletSecretDef from './wallet/helpers/mnemonicToWalletSecretDef'
import sanitizeMnemonic from './helpers/sanitizeMnemonic'
import {initialState} from './store'
import {toCoins, toAda, roundWholeAdas} from './helpers/adaConverters'
import captureBySentry from './helpers/captureBySentry'
import {State, Ada, Lovelace} from './state'
import CryptoProviderFactory from './wallet/byron/crypto-provider-factory'
import ShelleyCryptoProviderFactory from './wallet/shelley/shelley-crypto-provider-factory'
import {ShelleyWallet} from './wallet/shelley-wallet'
import getDonationAddress from './helpers/getDonationAddress'

let wallet: ReturnType<typeof CardanoWallet | typeof ShelleyWallet>

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

type SetStateFn = (newState: Partial<State>) => void
type GetStateFn = () => State
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

  const loadWallet = async (state, {cryptoProviderType, walletSecretDef, isWebUSB}) => {
    // loadingAction(state, `Waiting for ${state.hwWalletName}...`)
    loadingAction(state, 'Loading wallet data...', {
      walletLoadingError: undefined,
    })
    const isShelleyCompatible = !(walletSecretDef && walletSecretDef.derivationScheme.type === 'v1')
    try {
      switch (ADALITE_CONFIG.ADALITE_CARDANO_VERSION) {
        case 'byron': {
          const cryptoProvider = await CryptoProviderFactory.getCryptoProvider(cryptoProviderType, {
            walletSecretDef,
            network: NETWORKS.BYRON.MAINNET,
            config: ADALITE_CONFIG,
          })

          wallet = CardanoWallet({
            cryptoProvider,
            config: ADALITE_CONFIG,
          })
          break
        }
        case 'shelley': {
          const cryptoProvider = await ShelleyCryptoProviderFactory.getCryptoProvider(
            cryptoProviderType,
            {
              walletSecretDef,
              network: NETWORKS.SHELLEY[ADALITE_CONFIG.ADALITE_NETWORK],
              config: ADALITE_CONFIG,
              isWebUSB,
            }
          )

          wallet = await ShelleyWallet({
            config: ADALITE_CONFIG,
            cryptoProvider,
            isShelleyCompatible,
          })
          break
        }
        default:
          throw Error('bad cardano version')
      }
      const walletInfo = await wallet.getWalletInfo()
      const conversionRatesPromise = getConversionRates(state)
      const usingHwWallet = wallet.isHwWallet()
      const hwWalletName = usingHwWallet ? wallet.getWalletName() : undefined
      if (usingHwWallet) loadingAction(state, `Waiting for ${hwWalletName}...`)
      const demoRootSecret = (await mnemonicToWalletSecretDef(
        ADALITE_CONFIG.ADALITE_DEMO_WALLET_MNEMONIC
      )).rootSecret
      const isDemoWallet = walletSecretDef && walletSecretDef.rootSecret.equals(demoRootSecret)
      const autoLogin = state.autoLogin
      const ticker2Id = null
      setState({
        walletIsLoaded: true,
        ...walletInfo,
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

  const reloadWalletInfo = async (state) => {
    loadingAction(state, 'Reloading wallet info...')
    try {
      const walletInfo = await wallet.getWalletInfo()
      const conversionRates = getConversionRates(state)

      // timeout setting loading state, so that loading shows even if everything was cached
      setTimeout(() => setState({loading: false}), 500)
      setState({
        ...walletInfo,
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
        await wallet.verifyAddress(address || newState.showAddressDetail.address)
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
      shouldShowAddressVerification: undefined,
    })
  }

  /* TRANSACTION */

  const confirmTransaction = async (state, txConfirmType) => {
    let txAux
    const newState = getState()
    try {
      if (newState.sendTransactionSummary.plan) {
        txAux = await wallet.prepareTxAux(newState.sendTransactionSummary.plan)
      } else {
        loadingAction(state, 'Preparing transaction plan...')
        await sleep(1000) // wait for plan to be set in case of unfortunate timing
        const retriedState = getState()
        txAux = await wallet.prepareTxAux(retriedState.sendTransactionSummary.plan)
      }
    } catch (e) {
      throw NamedError('TransactionCorrupted', {causedBy: e})
    } finally {
      stopLoadingAction(state, {})
    }

    setState({
      shouldShowConfirmTransactionDialog: true,
      txConfirmType,
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
      sendAmountValidator(state.sendAmount.fieldValue, state.sendAmount.coins, state.balance)
    )
    setErrorState(
      'donationAmountValidationError',
      donationAmountValidator(
        state.donationAmount.fieldValue,
        state.donationAmount.coins,
        state.balance
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
    const plan = await wallet.getTxPlan(args)
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
    const validationError = txPlanValidator(coins, state.balance, plan, donationAmount)
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

  const updateAddress = (state, e) => {
    setState({
      sendResponse: '',
      sendAddress: Object.assign({}, state.sendAddress, {
        fieldValue: e.target.value,
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
    const address = await wallet.getChangeAddress()
    const maxAmount = await wallet.getMaxNonStakingAmount(address)
    const coins = maxAmount && maxAmount.sendAmount
    const plan = await prepareTxPlan({address, coins, txType: 'convert'})
    const validationError = txPlanValidator(coins, state.balance, plan)
    if (validationError) {
      setErrorState('transactionSubmissionError', validationError, {
        shouldShowTransactionErrorModal: true,
      })
      stopLoadingAction(state, {})
      return
    }
    setState({
      keepConfirmationDialogOpen: true,
    })
    setTransactionSummary('stake', plan, coins)
    await confirmTransaction(getState(), 'convert')
    stopLoadingAction(state, {})
  }

  const withdrawRewards = async (state) => {
    loadingAction(state, 'Preparing transaction...')
    const rewards = state.shelleyBalances.rewardsAccountBalance
    const plan = await prepareTxPlan({rewards, txType: 'withdraw'})
    const withdrawalValidationError =
      withdrawalPlanValidator(rewards, state.balance, plan) || wallet.checkCryptoProviderVersion()
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
    const poolInfo = await wallet.getPoolInfo(state.shelleyDelegation.selectedPool.url)
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
    const stakingKeyRegistered = state.shelleyAccountInfo.hasStakingKey
    const plan = await prepareTxPlan({poolHash, stakingKeyRegistered, txType: 'delegate'})
    const newState = getState()
    if (hasPoolIdentifiersChanged(newState)) {
      return
    }
    const validationError = delegationPlanValidator(newState.balance, plan)
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

  const selectAdaliteStakepool = () => {
    updateStakePoolIdentifier(getState(), null, ADALITE_CONFIG.ADALITE_STAKE_POOL_ID)
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
      const txAux = await wallet.prepareTxAux(state.sendTransactionSummary.plan)
      const signedTx = await wallet.signTxAux(txAux)

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
      wallet.generateNewSeeds()
      await reloadWalletInfo(state)
      selectAdaliteStakepool()
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
    window.localStorage.setItem('dontShowDisclaimer', dontShowDisclaimer)
    setState({
      displayWelcome: false,
    })
  }

  const openInfoModal = (state) => {
    setState({
      displayInfoModal: true,
    })
  }

  const closeInfoModal = (state, dontShowDisclaimer) => {
    // we may get an ignored click event as the second argument, check only against booleans
    window.localStorage.setItem('dontShowInfoModal', dontShowDisclaimer)
    setState({
      displayInfoModal: false,
    })
  }

  const closeStakingBanner = (state) => {
    window.localStorage.setItem('dontShowStakingBannerTestnet3', 'true')
    setState({
      shouldShowStakingBanner: false,
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

  const toggleDisplayStakingPage = (state, value) => {
    setState({displayStakingPage: value})
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
    toggleDisplayStakingPage,
    selectAdaliteStakepool,
    convertNonStakingUtxos,
    loadErrorBannerContent,
    withdrawRewards,
    openInfoModal,
    closeInfoModal,
  }
}
