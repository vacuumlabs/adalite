import {ADALITE_CONFIG} from './config'
import {saveAs} from './libs/file-saver'
import {encode, decode} from 'borc'
import {
  sendAddressValidator,
  sendAmountValidator,
  txPlanValidator,
  delegationPlanValidator,
  withdrawalPlanValidator,
  mnemonicValidator,
  validatePoolRegUnsignedTx,
  tokenAmountValidator,
} from './helpers/validators'
import debugLog from './helpers/debugLog'
import getConversionRates from './helpers/getConversionRates'
import sleep from './helpers/sleep'
import {
  NETWORKS,
  PREMIUM_MEMBER_BALANCE_TRESHOLD,
  BIG_DELEGATOR_THRESHOLD,
} from './wallet/constants'
import {CryptoProviderType} from './wallet/types'
import NamedError from './helpers/NamedError'
import {exportWalletSecretDef} from './wallet/keypass-json'
import mnemonicToWalletSecretDef from './wallet/helpers/mnemonicToWalletSecretDef'
import sanitizeMnemonic from './helpers/sanitizeMnemonic'
import {initialState} from './store'
import captureBySentry from './helpers/captureBySentry'
import {State, GetStateFn, SetStateFn, getSourceAccountInfo} from './state'
import ShelleyCryptoProviderFactory from './wallet/shelley/shelley-crypto-provider-factory'
import {ShelleyWallet} from './wallet/shelley-wallet'
import {parseUnsignedTx} from './helpers/cliParser/parser'
import {
  calculateMinUTxOLovelaceAmount,
  TxPlan,
  TxPlanResult,
  TxPlanResultType,
  unsignedPoolTxToTxPlan,
} from './wallet/shelley/shelley-transaction-planner'
import getDonationAddress from './helpers/getDonationAddress'
import {localStorageVars} from './localStorage'
import {
  AccountInfo,
  Lovelace,
  CryptoProviderFeature,
  _Address,
  TxType,
  TxPlanArgs,
  AuthMethodType,
  HexString,
  SendAmount,
  AssetFamily,
  SendTransactionSummary,
  WithdrawTransactionSummary,
  DelegateTransactionSummary,
} from './types'
import {MainTabs} from './constants'

let wallet: ReturnType<typeof ShelleyWallet>

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

  const setAuthMethod = (state: State, option: AuthMethodType): void => {
    setState({
      authMethod: option,
      shouldShowExportOption:
        option === AuthMethodType.MNEMONIC || option === AuthMethodType.KEY_FILE,
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

  const getWalletInfo = (accountsInfo: Array<AccountInfo>) => {
    const totalWalletBalance = accountsInfo.reduce((a, {balance}) => balance + a, 0)
    const totalRewardsBalance = accountsInfo.reduce(
      (a, {shelleyBalances}) => shelleyBalances.rewardsAccountBalance + a,
      0
    )
    const shouldShowSaturatedBanner = accountsInfo.some(
      ({poolRecommendation}) => poolRecommendation.shouldShowSaturatedBanner
    )
    return {
      totalWalletBalance,
      totalRewardsBalance,
      shouldShowSaturatedBanner,
    }
  }

  /* LOADING WALLET */

  const loadWallet = async (
    state: State,
    {
      cryptoProviderType,
      walletSecretDef,
      forceWebUsb,
      shouldExportPubKeyBulk,
    }: {
      cryptoProviderType: CryptoProviderType
      walletSecretDef: any
      forceWebUsb: boolean
      shouldExportPubKeyBulk: boolean
    }
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
          network: NETWORKS[ADALITE_CONFIG.ADALITE_NETWORK],
          config,
          forceWebUsb, // TODO: into config
        }
      )

      wallet = await ShelleyWallet({
        config,
        cryptoProvider,
      })

      const validStakepoolDataProvider = await wallet.getStakepoolDataProvider()
      const accountsInfo = await wallet.getAccountsInfo(validStakepoolDataProvider)
      const {totalRewardsBalance, totalWalletBalance, shouldShowSaturatedBanner} = getWalletInfo(
        accountsInfo
      )

      const conversionRatesPromise = getConversionRates(state)
      const usingHwWallet = wallet.isHwWallet()
      const maxAccountIndex = wallet.getMaxAccountIndex()
      const hwWalletName = usingHwWallet ? wallet.getWalletName() : undefined
      const shouldNumberAccountsFromOne = hwWalletName === 'Trezor'
      if (usingHwWallet) loadingAction(state, `Waiting for ${hwWalletName}...`)
      const demoRootSecret = (
        await mnemonicToWalletSecretDef(ADALITE_CONFIG.ADALITE_DEMO_WALLET_MNEMONIC)
      ).rootSecret
      const isDemoWallet = walletSecretDef && walletSecretDef.rootSecret.equals(demoRootSecret)
      const autoLogin = state.autoLogin
      const shouldShowPremiumBanner =
        state.shouldShowPremiumBanner && PREMIUM_MEMBER_BALANCE_TRESHOLD < totalWalletBalance
      const isBigDelegator = totalWalletBalance > BIG_DELEGATOR_THRESHOLD
      setState({
        validStakepoolDataProvider,
        accountsInfo,
        maxAccountIndex,
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
        sendAmount: {assetFamily: AssetFamily.ADA, fieldValue: '', coins: 0 as Lovelace},
        sendAddress: {fieldValue: ''},
        sendResponse: '',
        // shelley
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
      const accountsInfo = await wallet.getAccountsInfo(state.validStakepoolDataProvider)
      const conversionRates = getConversionRates(state)

      // timeout setting loading state, so that loading shows even if everything was cached
      setTimeout(() => setState({loading: false}), 500)
      setState({
        accountsInfo,
        ...getWalletInfo(accountsInfo),
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
      authMethod: AuthMethodType.MNEMONIC,
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
      authMethod: AuthMethodType.MNEMONIC,
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

  const verifyAddress = async (state: State, address?: string) => {
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

  const confirmTransaction = async (state: State, txConfirmType): Promise<void> => {
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

    const isTxBetweenAccounts = state.activeMainTab === MainTabs.ACCOUNT && txConfirmType === 'send'
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

  const setRawTransactionOpen = (state: State, open: boolean) => {
    setState({
      rawTransactionOpen: open,
    })
  }

  const closeTransactionErrorModal = (state: State) => {
    setState({
      shouldShowTransactionErrorModal: false,
    })
  }

  /* SEND ADA */

  const setTransactionSummary = (
    plan: TxPlan,
    transactionSummary:
      | SendTransactionSummary
      | WithdrawTransactionSummary
      | DelegateTransactionSummary
  ) => {
    setState({
      sendTransactionSummary: {
        ...transactionSummary,
        fee: plan.fee,
        plan,
      },
    })
  }

  const resetTransactionSummary = (state: State) => {
    setState({
      sendTransactionSummary: {
        // TODO: we should reset this to null
        type: TxType.SEND_ADA,
        sendAddress: {fieldValue: ''},
        sendAmount: {assetFamily: AssetFamily.ADA, fieldValue: '', coins: 0 as Lovelace},
        minimalLovelaceAmount: 0 as Lovelace,
        fee: 0 as Lovelace,
        plan: null,
      },
    })
  }

  const resetSendFormState = (state: State) => {
    setState({
      sendResponse: '',
      loading: false,
      shouldShowConfirmTransactionDialog: false,
    })
  }

  const resetSendFormFields = (state: State) => {
    setState({
      sendAmount: {assetFamily: AssetFamily.ADA, fieldValue: '', coins: 0 as Lovelace},
      sendAddress: {fieldValue: ''},
      sendAddressValidationError: null,
      sendAmountValidationError: null,
      transactionFee: 0 as Lovelace,
    })
  }

  const resetDelegation = () => {
    setState({
      shelleyDelegation: {
        delegationFee: 0 as Lovelace,
        selectedPool: null,
      },
    })
  }

  const validateSendForm = (state: State) => {
    setErrorState('sendAddressValidationError', sendAddressValidator(state.sendAddress.fieldValue))
    if (state.sendAmount.assetFamily === AssetFamily.ADA) {
      const sendAmountValidationError = sendAmountValidator(
        state.sendAmount.fieldValue,
        state.sendAmount.coins,
        getSourceAccountInfo(state).balance as Lovelace
      )
      setErrorState('sendAmountValidationError', sendAmountValidationError)
    }
    if (state.sendAmount.assetFamily === AssetFamily.TOKEN) {
      const {policyId, assetName, quantity} = state.sendAmount.token
      // TODO: we should have a tokenProvider to get token O(1)
      const tokenBalance = getSourceAccountInfo(state).tokenBalance.find(
        (token) => token.policyId === policyId && token.assetName === assetName
      ).quantity
      const sendAmountValidationError = tokenAmountValidator(
        state.sendAmount.fieldValue,
        quantity,
        tokenBalance
      )
      setErrorState('sendAmountValidationError', sendAmountValidationError)
    }
  }

  const isSendFormFilledAndValid = (state: State) =>
    state.sendAddress.fieldValue !== '' &&
    state.sendAmount.fieldValue !== '' &&
    !state.sendAddressValidationError &&
    !state.sendAmountValidationError

  const prepareTxPlan = async (args: TxPlanArgs): Promise<TxPlanResult> => {
    const state = getState()
    try {
      return await wallet.getAccount(state.sourceAccountIndex).getTxPlan(args)
    } catch (e) {
      // TODO: refactor setErrorState to check all errors if there unexpected
      if (e.name !== 'NetworkError' && e.name !== 'ServerError') {
        throw e
      }
      return {
        type: TxPlanResultType.FAILURE,
        estimatedFee: 0 as Lovelace,
        error: {code: e.name},
      }
    }
  }

  const calculateFee = async (): Promise<void> => {
    const state = getState()
    if (!isSendFormFilledAndValid(state)) {
      setState({
        calculatingFee: false,
        transactionFee: 0,
      })
      return
    }
    const sendAmount = {...state.sendAmount}
    // TODO: sendAddress should have a validated field of type _Address
    const address = state.sendAddress.fieldValue as _Address
    const txPlanResult = await prepareTxPlan({
      address,
      sendAmount,
      txType: TxType.SEND_ADA,
    })
    const balance = getSourceAccountInfo(state).balance as Lovelace
    const minimalLovelaceAmount = calculateMinUTxOLovelaceAmount(
      sendAmount.assetFamily === AssetFamily.ADA ? [] : [sendAmount.token]
    )
    const coins = sendAmount.assetFamily === AssetFamily.ADA ? sendAmount.coins : (0 as Lovelace)

    if (txPlanResult.type === TxPlanResultType.SUCCESS) {
      const newState = getState() // if the values changed meanwhile
      if (
        newState.sendAmount.fieldValue !== state.sendAmount.fieldValue ||
        newState.sendAddress.fieldValue !== state.sendAddress.fieldValue ||
        newState.sendAmount.assetFamily !== state.sendAmount.assetFamily
      ) {
        return
      }
      const sendTransactionSummary: SendTransactionSummary = {
        type: TxType.SEND_ADA,
        sendAddress: newState.sendAddress,
        sendAmount,
        minimalLovelaceAmount,
      }
      setTransactionSummary(txPlanResult.txPlan, sendTransactionSummary)
      setState({
        calculatingFee: false,
        txSuccessTab: '',
        transactionFee: txPlanResult.txPlan.fee,
      })
    } else {
      const validationError =
        txPlanValidator(coins, minimalLovelaceAmount, balance, txPlanResult.estimatedFee) ||
        txPlanResult.error
      setErrorState('sendAmountValidationError', validationError)
      setState({
        calculatingFee: false,
        txSuccessTab: '',
        transactionFee: txPlanResult.estimatedFee,
      })
    }
  }

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
      setState({calculatingFee: false})
    }
  }

  const updateAddress = (state: State, e, address?: string) => {
    setState({
      sendResponse: '',
      sendAddress: Object.assign({}, state.sendAddress, {
        fieldValue: address || e.target.value,
      }),
    })
    validateSendFormAndCalculateFee()
  }

  const updateAmount = (state: State, sendAmount: SendAmount): void => {
    setState({
      sendResponse: '',
      sendAmount: Object.assign({}, state.sendAmount, sendAmount),
    })
    validateSendFormAndCalculateFee()
  }

  const validateAndSetMaxFunds = (state: State, maxAmounts) => {
    // TODO: some special validation

    updateAmount(state, maxAmounts)
  }

  const sendMaxFunds = async (state: State) => {
    setState({calculatingFee: true})
    try {
      const maxAmounts = await wallet
        .getAccount(state.sourceAccountIndex)
        .getMaxSendableAmount(state.sendAddress.fieldValue as _Address, state.sendAmount)
      validateAndSetMaxFunds(state, maxAmounts)
    } catch (e) {
      setState({
        calculatingFee: false,
      })
      setErrorState('sendAmountValidationError', {code: e.name})
      return
    }
  }

  const convertNonStakingUtxos = async (state: State): Promise<void> => {
    loadingAction(state, 'Preparing transaction...')
    const address = await wallet.getAccount(state.sourceAccountIndex).getChangeAddress()
    const sendAmount = await wallet
      .getAccount(state.sourceAccountIndex)
      .getMaxNonStakingAmount(address)
    const coins = sendAmount.assetFamily === AssetFamily.ADA && sendAmount.coins
    const txPlanResult = await prepareTxPlan({
      address,
      sendAmount,
      txType: TxType.CONVERT_LEGACY,
    })
    const balance = getSourceAccountInfo(state).balance as Lovelace

    if (txPlanResult.type === TxPlanResultType.SUCCESS) {
      const sendTransactionSummary: SendTransactionSummary = {
        type: TxType.SEND_ADA,
        sendAmount,
        sendAddress: {fieldValue: address},
        minimalLovelaceAmount: 0 as Lovelace,
      }
      setTransactionSummary(txPlanResult.txPlan, sendTransactionSummary)
      await confirmTransaction(getState(), 'convert')
    } else {
      const validationError =
        txPlanValidator(coins, 0 as Lovelace, balance, txPlanResult.estimatedFee) ||
        txPlanResult.error
      setErrorState('transactionSubmissionError', validationError, {
        shouldShowTransactionErrorModal: true,
      })
    }
    stopLoadingAction(state, {})
  }

  const withdrawRewards = async (state: State): Promise<void> => {
    const supportError = wallet.ensureFeatureIsSupported(CryptoProviderFeature.WITHDRAWAL)
    if (supportError) {
      setErrorState('transactionSubmissionError', supportError, {
        shouldShowTransactionErrorModal: true,
      })
      return
    }
    loadingAction(state, 'Preparing transaction...')
    // TODO: rewards should be of type Lovelace
    const rewards = getSourceAccountInfo(state).shelleyBalances.rewardsAccountBalance as Lovelace
    const stakingAddress = getSourceAccountInfo(state).stakingAddress
    const txPlanResult = await prepareTxPlan({rewards, stakingAddress, txType: TxType.WITHDRAW})
    // TODO: balance should be of type Lovelace
    const balance = getSourceAccountInfo(state).balance as Lovelace

    if (txPlanResult.type === TxPlanResultType.SUCCESS) {
      const withdrawTransactionSummary: WithdrawTransactionSummary = {
        type: TxType.WITHDRAW,
        rewards,
      }
      setTransactionSummary(txPlanResult.txPlan, withdrawTransactionSummary)
      await confirmTransaction(getState(), 'withdraw')
    } else {
      const withdrawalValidationError =
        withdrawalPlanValidator(rewards, balance, txPlanResult.estimatedFee) ||
        wallet.ensureFeatureIsSupported(CryptoProviderFeature.WITHDRAWAL) ||
        txPlanResult.error
      setErrorState('transactionSubmissionError', withdrawalValidationError, {
        shouldShowTransactionErrorModal: true,
      })
    }
    stopLoadingAction(state, {})
  }

  /* DELEGATE */

  const hasPoolIdentifiersChanged = (state: State) => {
    const {shelleyDelegation: newShelleyDelegation} = getState()
    return (
      newShelleyDelegation.selectedPool.poolHash !== state.shelleyDelegation.selectedPool.poolHash
    )
    // maybe also check if tab changed
  }

  const setPoolInfo = async (state: State) => {
    if (hasPoolIdentifiersChanged(state)) {
      return
    }
    const poolInfo = !state.shelleyDelegation.selectedPool.name
      ? await wallet
        .getAccount(state.sourceAccountIndex)
        .getPoolInfo(state.shelleyDelegation.selectedPool.url)
      : {}
    if (hasPoolIdentifiersChanged(state)) {
      return
    }
    const newState = getState()
    setState({
      shelleyDelegation: {
        ...state.shelleyDelegation,
        selectedPool: {
          ...state.shelleyDelegation.selectedPool,
          ...poolInfo,
        },
        delegationFee: newState.shelleyDelegation.delegationFee,
      },
      gettingPoolInfo: false,
    })
  }

  const calculateDelegationFee = async (): Promise<void> => {
    const state = getState()
    setPoolInfo(state)
    const poolHash = state.shelleyDelegation.selectedPool.poolHash as string
    const isStakingKeyRegistered = getSourceAccountInfo(state).shelleyAccountInfo.hasStakingKey
    const stakingAddress = getSourceAccountInfo(state).stakingAddress
    const txPlanResult = await prepareTxPlan({
      poolHash,
      stakingAddress,
      isStakingKeyRegistered,
      txType: TxType.DELEGATE,
    })
    const newState = getState()
    if (hasPoolIdentifiersChanged(newState)) {
      return
    }
    const balance = getSourceAccountInfo(state).balance as Lovelace

    if (txPlanResult.type === TxPlanResultType.SUCCESS) {
      setState({
        shelleyDelegation: {
          ...newState.shelleyDelegation,
          delegationFee: txPlanResult.txPlan.fee + txPlanResult.txPlan.deposit,
        },
      })
      const delegationTransactionSummary: DelegateTransactionSummary = {
        type: TxType.DELEGATE,
        deposit: txPlanResult.txPlan.deposit,
        stakePool: newState.shelleyDelegation.selectedPool,
      }
      setTransactionSummary(txPlanResult.txPlan, delegationTransactionSummary)
      setState({
        calculatingDelegationFee: false,
        txSuccessTab: newState.txSuccessTab === 'send' ? newState.txSuccessTab : '',
      })
    } else {
      const validationError =
        delegationPlanValidator(balance, 0 as Lovelace, txPlanResult.estimatedFee) ||
        txPlanResult.error
      setErrorState('delegationValidationError', validationError, {
        calculatingDelegationFee: false,
      })
    }
  }

  const debouncedCalculateDelegationFee = debounceEvent(calculateDelegationFee, 500)

  const validateDelegationAndCalculateFee = () => {
    const state = getState()
    const selectedPool = state.shelleyDelegation.selectedPool
    const delegationValidationError = selectedPool.validationError

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
          delegationFee: 0 as Lovelace,
        },
      })
    }
  }

  const updateStakePoolIdentifier = (
    state: State,
    poolHash: string,
    validationError: any = null
  ): void => {
    const newPool = poolHash && state.validStakepoolDataProvider.getPoolInfoByPoolHash(poolHash)
    const oldPool = state.shelleyDelegation.selectedPool
    if (newPool && newPool?.poolHash === oldPool?.poolHash) return
    setState({
      shelleyDelegation: {
        ...state.shelleyDelegation,
        selectedPool: {
          ...newPool,
          validationError,
        },
      },
    })
    if (validationError) return
    validateDelegationAndCalculateFee()
  }

  const resetStakePoolIndentifier = (): void => {
    resetDelegation()
    setState({
      delegationValidationError: null,
    })
  }

  const selectAdaliteStakepool = (state: State): void => {
    const newState = getState()
    updateStakePoolIdentifier(
      newState,
      getSourceAccountInfo(newState).poolRecommendation.recommendedPoolHash
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

  const exploreNextAccount = async (state: State) => {
    try {
      loadingAction(state, 'Loading account')
      const nextAccount = await wallet.exploreNextAccount()
      const accountInfo = await nextAccount.getAccountInfo(state.validStakepoolDataProvider)
      const accountsInfo = [...state.accountsInfo, accountInfo]
      setState({
        //@ts-ignore TODO: refactor type AccountInfo
        accountsInfo,
        //@ts-ignore TODO: refactor type AccountInfo
        ...getWalletInfo(accountsInfo),
      })
      setActiveAccount(state, nextAccount.accountIndex)
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
      sendTransactionTitle: 'Transfer funds between accounts', // TODO: remove this
      shouldShowSendTransactionModal: true,
      txSuccessTab: '',
      sendAmount: {assetFamily: AssetFamily.ADA, fieldValue: '', coins: 0 as Lovelace}, // TODO: use reset function
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
      sendAmount: {assetFamily: AssetFamily.ADA, fieldValue: '', coins: 0 as Lovelace},
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
      delegationTitle: state.shouldNumberAccountsFromOne // TODO: remove this from state
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

  const waitForTxToAppearOnBlockchain = async (
    state: State,
    txHash: HexString,
    pollingInterval: number,
    maxRetries: number
  ) => {
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

  const submitTransaction = async (state: State) => {
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
    const txTab = state.sendTransactionSummary.type
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
      const didDonate = address === getDonationAddress()
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
      await reloadWalletInfo(state)
      wallet.getAccount(state.sourceAccountIndex).generateNewSeeds()
      resetAccountIndexes(state)
      resetDelegation()
      selectAdaliteStakepool(state)
      setState({
        waitingForHwWallet: false,
        // TODO: refactor txSuccesTab
        txSuccessTab:
          sendResponse && sendResponse.success && txTab === TxType.SEND_ADA ? 'send' : 'stake',
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

  const openWelcome = (state: State) => {
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

  const setActiveMainTab = (state: State, mainTab: MainTabs) => {
    resetAccountIndexes(state)
    setState({activeMainTab: mainTab})
    resetTransactionSummary(state)
    resetSendFormFields(state)
    resetDelegation()
    if (mainTab === MainTabs.STAKING) selectAdaliteStakepool(state)
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
    if (!file || !file.cborHex) {
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
      // TODO: refactor
      const supportError = wallet.ensureFeatureIsSupported(CryptoProviderFeature.POOL_OWNER)
      if (supportError) throw NamedError(supportError.code, {message: supportError.params.message})
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
    const type = key === 0 ? 'TxWitness AllegraEra' : 'TxWitnessByron'
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
    calculateDelegationFee,
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
    setLogoutNotificationOpen,
    setRawTransactionOpen,
    closeTransactionErrorModal,
    closeWalletLoadingErrorModal,
    closeUnexpectedErrorModal,
    shouldShowContactFormModal,
    closeContactFormModal,
    closeStakingBanner,
    updateStakePoolIdentifier,
    resetStakePoolIndentifier,
    setActiveMainTab,
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
    exploreNextAccount,
    switchSourceAndTargetAccounts,
    loadPoolCertificateTx,
    downloadPoolSignature,
    openPoolCertificateTxModal,
    closePoolCertificateTxModal,
    signPoolCertificateTx,
  }
}
