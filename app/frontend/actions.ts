import {ADALITE_CONFIG} from './config'
import {saveAs} from './libs/file-saver'
import {encode} from 'borc'
import {
  parseCoins,
  sendAddressValidator,
  sendAmountValidator,
  feeValidator,
  mnemonicValidator,
  donationAmountValidator,
  poolIdValidator,
  delegationFeeValidator,
} from './helpers/validators'
import printAda from './helpers/printAda'
import debugLog from './helpers/debugLog'
import getConversionRates from './helpers/getConversionRates'
import sleep from './helpers/sleep'
import {ADA_DONATION_ADDRESS, NETWORKS} from './wallet/constants'
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

import {ShelleyWallet} from './wallet/shelley-wallet'
import ShelleyJsCryptoProvider from './wallet/shelley/shelley-js-crypto-provider'
import loadWasmModule from './helpers/wasmLoader'
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
            ...options,
          },
        },
        error: e,
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
    }
  }

  /* LOADING WALLET */

  const loadWallet = async (state, {cryptoProviderType, walletSecretDef}) => {
    loadingAction(state, 'Loading wallet data...', {
      walletLoadingError: undefined,
    })
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
          await loadWasmModule()
          const cryptoProvider = ShelleyJsCryptoProvider({
            walletSecretDef,
            network: NETWORKS.SHELLEY.INCENTIVIZED_TESTNET,
          })

          wallet = await ShelleyWallet({
            config: ADALITE_CONFIG,
            cryptoProvider,
          })
          break
        }
        default:
          throw Error('bad cardano version')
      }
      const walletInfo = await wallet.getWalletInfo()
      const conversionRatesPromise = getConversionRates(state)
      const usingHwWallet = wallet.isHwWallet()
      const hwWalletName = usingHwWallet ? wallet.getHwWalletName() : undefined
      const demoRootSecret = (await mnemonicToWalletSecretDef(
        ADALITE_CONFIG.ADALITE_DEMO_WALLET_MNEMONIC
      )).rootSecret
      const isDemoWallet = walletSecretDef && walletSecretDef.rootSecret.equals(demoRootSecret)
      const autoLogin = state.autoLogin
      const {validStakepools, ticker2Id} = await wallet.getValidStakepools()
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
        showDemoWalletWarningDialog: isDemoWallet && !autoLogin,
        showGenerateMnemonicDialog: false,
        // send form
        sendAmount: {fieldValue: '', coins: 0},
        sendAddress: {fieldValue: ''},
        donationAmount: {fieldValue: '', coins: 0},
        sendResponse: '',
        // shelley
        validStakepools,
        ticker2Id,
      })
      await fetchConversionRates(conversionRatesPromise)
    } catch (e) {
      setState({
        loading: false,
      })
      setErrorState('walletLoadingError', e)
      setState({
        showWalletLoadingErrorModal: true,
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
        showWalletLoadingErrorModal: true,
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
      showWalletLoadingErrorModal: false,
      authMethod: 'mnemonic',
      showExportOption: true,
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
      showGenerateMnemonicDialog: true,
      authMethod: 'mnemonic',
      showMnemonicInfoAlert: true,
    })
  }

  const closeGenerateMnemonicDialog = (state) => {
    setState({
      showGenerateMnemonicDialog: false,
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

  const verifyAddress = async () => {
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
        setErrorState('addressVerificationError', true)
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

  /* DONATION */

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

  const resetPercentageDonation = () => {
    setState({
      thresholdAmountReached: false,
      percentageDonationValue: 0,
      percentageDonationText: '0.2%',
    })
  }

  const resetDonation = () => {
    setState({
      checkedDonationType: '',
      donationAmount: {fieldValue: '', coins: 0},
    })
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
    const maxDonationAmount = await wallet
      .getMaxDonationAmount(state.sendAddress.fieldValue, state.sendAmount.coins as Lovelace)
      .catch((e) => {
        resetSendFormFields(state)
        setErrorState('transactionSubmissionError', e)
        setState({
          showTransactionErrorModal: true,
        })
        return
      })
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
      showCustomDonationInput: !state.showCustomDonationInput,
    })
    validateSendFormAndCalculateFee()
  }

  const closeThanksForDonationModal = (state) => {
    setState({
      showThanksForDonation: false,
    })
  }

  /* SEND ADA */

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

  const isSendFormFilledAndValid = (state) =>
    state.sendAddress.fieldValue !== '' &&
    state.sendAmount.fieldValue !== '' &&
    !state.sendAddressValidationError &&
    !state.sendAmountValidationError &&
    !state.donationAmountValidationError

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
    let plan
    plan = await prepareTxPlan({address, coins, donationAmount, txType: 'sendAda'})
    const newState = getState() // if the values changed meanwhile
    if (
      !plan ||
      newState.sendAmount.fieldValue !== state.sendAmount.fieldValue ||
      newState.sendAddress.fieldValue !== state.sendAddress.fieldValue ||
      newState.donationAmount.fieldValue !== state.donationAmount.fieldValue
    ) {
      return
    }
    setState({
      transactionFee: plan.fee || plan.estimatedFee,
    })
    const validationError = feeValidator(
      coins,
      plan.fee != null ? plan.fee : plan.estimatedFee,
      donationAmount,
      state.balance
    )
    setErrorState('sendAmountValidationError', validationError)
    setTransactionSummary('send', plan, coins, donationAmount)
    setState({
      calculatingFee: false,
      txSuccessTab: '',
    })
  }

  const prepareTxPlan = async (args) => {
    let plan
    try {
      plan = await wallet.getTxPlan(args)
    } catch (e) {
      stopLoadingAction(getState(), {})
      resetDelegation()
      setState({
        calculatingDelegationFee: false,
        calculatingFee: false,
      })
      setErrorState('transactionSubmissionError', e)
      setState({showTransactionErrorModal: true})
    }
    return plan
  }

  const setTransactionSummary = (tab, plan, coins?, donationAmount?) => {
    setState({
      sendTransactionSummary: {
        amount: coins || 0,
        donation: donationAmount || 0,
        fee: plan.fee != null ? plan.fee : plan.estimatedFee,
        plan: plan.fee != null ? plan : null,
        tab,
      },
    })
  }

  const resetAmountFields = (state) => {
    setState({
      donationAmount: {fieldValue: '', coins: 0},
      transactionFee: 0, // TODO(merc): call resetDonation instead?
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
    resetAmountFields(state)
  }

  const isSendAmountNonPositive = (fieldValue, validationError) =>
    fieldValue === '' ||
    (validationError &&
      (validationError.code === 'SendAmountIsNotPositive' ||
        validationError.code === 'SendAmountIsNan'))

  const debouncedCalculateFee = debounceEvent(calculateFee, 2000)

  const validateSendFormAndCalculateFee = () => {
    validateSendForm(getState())
    resetTransactionSummary()
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
        setErrorState('sendAmountValidationError', {code: e.name})
        return
      })
    validateAndSetMaxFunds(state, maxAmounts)
  }

  const convertNonStakingUtxos = async (state) => {
    loadingAction(state, 'Preparing transaction...')
    const address = await wallet.getChangeAddress()
    const {sendAmount: coins} = await wallet.getMaxNonStakingAmount(address)
    const balance = state.balance
    const plan = await prepareTxPlan({
      address,
      coins,
      donationAmount: null,
      txType: 'convert',
    })
    if (!plan) {
      return
    }
    if (balance < (plan.fee || plan.estimatedFee)) {
      setErrorState('transactionSubmissionError', NamedError('NonStakingConversionError'))
      setState({
        showTransactionErrorModal: true,
      })
      stopLoadingAction(state, {})
      return
    }
    setTransactionSummary('stake', plan, coins)
    confirmTransaction(getState(), 'convert')
    stopLoadingAction(state, {})
  }

  /* DELEGATE */

  const hasPoolIdentifiersChanged = (shelleyDelegation) => {
    const {shelleyDelegation: newShelleyDelegation} = getState()
    return (
      shelleyDelegation.length === newShelleyDelegation.selectedPools.length &&
      newShelleyDelegation.selectedPools.every(
        ({poolIdentifier}, index) =>
          poolIdentifier === shelleyDelegation.selectedPools[index].poolIdentifier
      )
    )
    // maybe also check if tab changed
  }

  const revokeDelegation = async (state) => {
    loadingAction(state, 'Preparing transaction...')
    await calculateDelegationFee(true)
    stopLoadingAction(state, {})
    confirmTransaction(getState(), 'revoke')
  }

  const calculateDelegationFee = async (revoke?: boolean) => {
    const state = getState()
    //TODO: some validation in case poolIdentifier changed(hasPoolIdentifierChanged)
    const pools = !revoke
      ? state.shelleyDelegation.selectedPools.map(({pool_id, ratio}) => {
        return {
          id: pool_id,
          ratio,
        }
      })
      : []
    const balance = state.balance
    const plan = await prepareTxPlan({coins: null, pools, txType: 'delegate'})
    if (!plan || hasPoolIdentifiersChanged(state)) {
      return
    }
    const validationError = delegationFeeValidator(plan.fee || plan.estimatedFee, balance)
    setErrorState('delegationValidationError', validationError)
    if (!validationError) {
      setState({
        shelleyDelegation: {
          ...state.shelleyDelegation,
          delegationFee: plan && plan.fee != null ? plan.fee : plan.estimatedFee,
        },
      })
      setTransactionSummary('stake', plan)
    }
    setState({
      calculatingDelegationFee: false,
      txSuccessTab: state.txSuccessTab === 'send' ? state.txSuccessTab : '',
    })
  }

  const debouncedCalculateDelegationFee = debounceEvent(calculateDelegationFee, 500)

  const validateDelegationAndCalculateFee = () => {
    const state = getState()
    const delegationValidationError = state.shelleyDelegation.selectedPools.every(
      (pool) => pool.validationError || pool.poolIdentifier === ''
    )
    setErrorState('delegationValidationError', delegationValidationError)
    setState({
      delegationValidationError,
    })
    if (!delegationValidationError) {
      setState({calculatingDelegationFee: true})
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

  const updateStakePoolIdentifier = (state, e) => {
    /**
     * this has to be redone,
     * pool validation must happen before debouncing
     * but pool info shown after
     */
    const poolIdentifier = e.target.value
    const poolId = state.ticker2Id[poolIdentifier] || poolIdentifier
    const selectedPools = state.shelleyDelegation.selectedPools
    setState({
      shelleyDelegation: {
        ...state.shelleyDelegation,
        selectedPools: selectedPools.map((pool, i) => {
          const index = parseInt(e.target.name, 10)
          const validationError = poolIdValidator(
            index,
            poolId,
            selectedPools,
            state.validStakepools
          )
          return i === index
            ? {
              validationError,
              // 100 just while multiple delegation isnt supported
              ratio: 100,
              ...state.validStakepools[poolId],
              poolIdentifier,
            }
            : pool
        }),
      },
    })
    validateDelegationAndCalculateFee()
  }

  const selectAdaliteStakepool = () => {
    const state = getState()
    const poolInfo =
      state.validStakepools && state.validStakepools[ADALITE_CONFIG.ADALITE_STAKE_POOL_ID]
    setState({
      shelleyDelegation: {
        ...state.shelleyDelegation,
        selectedPools: [
          {
            validationError: !poolInfo,
            ...poolInfo,
            ratio: 100,
            poolIdentifier: poolInfo.pool_id,
          },
        ],
      },
    })
    validateDelegationAndCalculateFee()
  }

  const resetDelegationToAdalite = () => {
    selectAdaliteStakepool()
  }

  const resetDelegation = () => {
    setState({
      shelleyDelegation: {
        delegationFee: 0,
        selectedPools: [
          {
            poolIdentifier: '',
          },
        ],
      },
    })
  }

  /* TRANSACTION */

  const resetTransactionSummary = () => {
    setState({
      sendTransactionSummary: {
        amount: 0 as Lovelace,
        fee: 0 as Lovelace,
        donation: 0 as Lovelace,
        plan: null,
        tab: '',
      },
    })
  }

  const confirmTransaction = (state, txConfirmType) => {
    let txAux
    try {
      txAux = wallet.prepareTxAux(state.sendTransactionSummary.plan)
    } catch (e) {
      throw NamedError('TransactionCorrupted')
    }

    console.log(state.sendTransactionSummary)

    setState({
      showConfirmTransactionDialog: true,
      txConfirmType,
      // TODO: maybe do this only on demand
      rawTransaction: Buffer.from(encode(txAux)).toString('hex'),
      rawTransactionOpen: false,
    })
  }

  const cancelTransaction = () => ({
    showConfirmTransactionDialog: false,
  })

  const setRawTransactionOpen = (state, open) => {
    setState({
      rawTransactionOpen: open,
    })
  }

  const closeTransactionErrorModal = (state) => {
    setState({
      showTransactionErrorModal: false,
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
    const txTab = state.sendTransactionSummary.tab
    try {
      const txAux = wallet.prepareTxAux(state.sendTransactionSummary.plan)
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
      const didDonate = address === ADA_DONATION_ADDRESS || donationAmount > 0

      if (didDonate) {
        setState({showThanksForDonation: true})
      }
    } catch (e) {
      setErrorState('transactionSubmissionError', e, {
        txHash: txSubmitResult && txSubmitResult.txHash,
      })
      setState({
        showTransactionErrorModal: true,
      })
    } finally {
      resetSendFormFields(state)
      resetSendFormState(state)
      resetAmountFields(state)
      resetDelegationToAdalite()
      resetTransactionSummary()
      wallet.generateNewSeeds()
      await reloadWalletInfo(state)
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

  const openWelcome = async (state) => {
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
    window.localStorage.setItem('dontShowStakingBannerTestnet2', 'true')
    setState({
      showStakingBanner: false,
    })
  }

  const showContactFormModal = async (state) => {
    setState({
      showContactFormModal: true,
    })
  }

  const closeContactFormModal = (state) => {
    setState({
      showContactFormModal: false,
    })
  }

  const setLogoutNotificationOpen = (state, open) => {
    setState({
      logoutNotificationOpen: open,
    })
  }

  const toggleDisplayStakingPage = async (state, value) => {
    setState({displayStakingPage: value})
    resetTransactionSummary()
    resetSendFormFields(state)
  }

  const closeUnexpectedErrorModal = (state) => {
    setState({
      showUnexpectedErrorModal: false,
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
    closeThanksForDonationModal,
    setLogoutNotificationOpen,
    setRawTransactionOpen,
    closeTransactionErrorModal,
    closeWalletLoadingErrorModal,
    closeUnexpectedErrorModal,
    showContactFormModal,
    closeContactFormModal,
    updateDonation,
    toggleCustomDonation,
    setDonation,
    resetDonation,
    closeStakingBanner,
    updateStakePoolIdentifier,
    toggleDisplayStakingPage,
    revokeDelegation,
    selectAdaliteStakepool,
    convertNonStakingUtxos,
  }
}
