import {Store, State, getSourceAccountInfo} from '../state'
import {getWallet} from './wallet'
import loadingActions from './loading'
import errorActions from './error'
import commonActions from './common'
import transactionActions from './transaction'
import {
  sendAddressValidator,
  sendAmountValidator,
  tokenAmountValidator,
  txPlanValidator,
  withdrawalPlanValidator,
} from '../helpers/validators'
import {
  SendTransactionSummary,
  WithdrawTransactionSummary,
  TxType,
  Lovelace,
  AssetFamily,
  Address,
  SendAmount,
  CryptoProviderFeature,
} from '../types'
import debounceEvent from '../helpers/debounceEvent'

export default (store: Store) => {
  const {setState, getState} = store
  const {setError} = errorActions(store)
  const {loadingAction, stopLoadingAction} = loadingActions(store)
  const {confirmTransaction} = transactionActions(store)
  const {resetTransactionSummary, setTransactionSummary, prepareTxPlan} = commonActions(store)

  const validateSendForm = (state: State) => {
    setError(state, {
      errorName: 'sendAddressValidationError',
      error: sendAddressValidator(state.sendAddress.fieldValue),
    })
    if (state.sendAmount.assetFamily === AssetFamily.ADA) {
      const sendAmountValidationError = sendAmountValidator(
        state.sendAmount.fieldValue,
        state.sendAmount.coins,
        getSourceAccountInfo(state).balance as Lovelace
      )
      setError(state, {
        errorName: 'sendAmountValidationError',
        error: sendAmountValidationError,
      })
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
      setError(state, {
        errorName: 'sendAmountValidationError',
        error: sendAmountValidationError,
      })
    }
  }

  const isSendFormFilledAndValid = (state: State) =>
    state.sendAddress.fieldValue !== '' &&
    state.sendAmount.fieldValue !== '' &&
    !state.sendAddressValidationError &&
    !state.sendAmountValidationError

  /*
  REFACTOR: (calculateFee)
  => this should be just "async" function that calculates the "fee" based on its
  arguments, that other "actions" can call to obtain the fee (if they need it)
  => this function should not have any notion of "state/setState/getState"
  => components could call it directly to obtain the fee for parts of the screen where
  they need it, no need for storing it in global state (also it leads to "race-conditions")
  */
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
    // TODO: sendAddress should have a validated field of type Address
    const address = state.sendAddress.fieldValue as Address
    const txPlanResult = await prepareTxPlan({
      address,
      sendAmount,
      txType: TxType.SEND_ADA,
    })
    const balance = getSourceAccountInfo(state).balance as Lovelace
    const coins = sendAmount.assetFamily === AssetFamily.ADA ? sendAmount.coins : (0 as Lovelace)
    const token = sendAmount.assetFamily === AssetFamily.TOKEN ? sendAmount.token : null

    /*
    REFACTOR: (calculateFee)
    Setting transaction summary should not be the responsibility of action called "calculateFee"
    */
    if (txPlanResult.success === true) {
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
        address: newState.sendAddress.fieldValue as Address,
        coins,
        token,
        minimalLovelaceAmount: txPlanResult.txPlan.additionalLovelaceAmount,
      }
      setTransactionSummary(txPlanResult.txPlan, sendTransactionSummary)
      setState({
        calculatingFee: false,
        txSuccessTab: '',
        transactionFee: txPlanResult.txPlan.fee,
      })
    } else {
      /*
      REFACTOR: (calculateFee)
      Handling validation error should not be the responsibility of action called "calculateFee"
      */
      const validationError =
        txPlanValidator(
          coins,
          txPlanResult.minimalLovelaceAmount,
          balance,
          txPlanResult.estimatedFee
        ) || txPlanResult.error
      setError(state, {errorName: 'sendAmountValidationError', error: validationError})
      setState({
        calculatingFee: false,
        txSuccessTab: '',
        transactionFee: txPlanResult.estimatedFee,
      })
    }
  }

  const debouncedCalculateFee = debounceEvent(calculateFee, 2000)

  /*
  REFACTOR: (forms)
  This logic & state should be moved to components.
  */
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

  /*
  REFACTOR: (forms)
  This logic & state should be moved to components.
  */
  const updateAddress = (state: State, e, address?: string) => {
    setState({
      sendResponse: '',
      sendAddress: Object.assign({}, state.sendAddress, {
        fieldValue: address || e.target.value,
      }),
    })
    validateSendFormAndCalculateFee()
  }

  /*
  REFACTOR: (forms)
  This logic & state should be moved to components.
  */
  const updateAmount = (state: State, sendAmount: SendAmount): void => {
    setState({
      sendResponse: '',
      sendAmount: Object.assign({}, state.sendAmount, sendAmount),
    })
    validateSendFormAndCalculateFee()
  }

  const validateAndSetMaxFunds = (state: State, maxAmount: SendAmount) => {
    // TODO: some special validation

    updateAmount(state, maxAmount)
  }

  const sendMaxFunds = async (state: State) => {
    setState({calculatingFee: true})
    try {
      const maxAmounts = await getWallet()
        .getAccount(state.sourceAccountIndex)
        .getMaxSendableAmount(state.sendAddress.fieldValue as Address, state.sendAmount)
      validateAndSetMaxFunds(state, maxAmounts)
    } catch (e) {
      setState({
        calculatingFee: false,
      })
      setError(state, {errorName: 'sendAmountValidationError', error: {code: e.name}})
      return
    }
  }

  const convertNonStakingUtxos = async (state: State): Promise<void> => {
    loadingAction(state, 'Preparing transaction...')
    const address = await getWallet()
      .getAccount(state.sourceAccountIndex)
      .getChangeAddress()
    const sendAmount = await getWallet()
      .getAccount(state.sourceAccountIndex)
      // TODO: we should pass something more sensible
      .getMaxNonStakingAmount(address, {
        assetFamily: AssetFamily.ADA,
        fieldValue: '',
        coins: 0 as Lovelace,
      })
    const coins = sendAmount.assetFamily === AssetFamily.ADA && sendAmount.coins
    const txPlanResult = await prepareTxPlan({
      address,
      sendAmount,
      txType: TxType.CONVERT_LEGACY,
    })
    const balance = getSourceAccountInfo(state).balance as Lovelace

    if (txPlanResult.success === true) {
      const sendTransactionSummary: SendTransactionSummary = {
        type: TxType.SEND_ADA,
        address,
        coins,
        token: null,
        minimalLovelaceAmount: 0 as Lovelace,
      }
      setTransactionSummary(txPlanResult.txPlan, sendTransactionSummary)
      await confirmTransaction(getState(), 'convert')
    } else {
      const validationError =
        txPlanValidator(coins, 0 as Lovelace, balance, txPlanResult.estimatedFee) ||
        txPlanResult.error
      setError(state, {
        errorName: 'transactionSubmissionError',
        error: validationError,
      })
      setState({shouldShowTransactionErrorModal: true})
    }
    stopLoadingAction(state)
  }

  const withdrawRewards = async (state: State): Promise<void> => {
    const supportError = getWallet().ensureFeatureIsSupported(CryptoProviderFeature.WITHDRAWAL)
    if (supportError) {
      setError(state, {
        errorName: 'transactionSubmissionError',
        error: supportError,
      })
      setState({shouldShowTransactionErrorModal: true})
      return
    }
    loadingAction(state, 'Preparing transaction...')
    // TODO: rewards should be of type Lovelace
    const rewards = getSourceAccountInfo(state).shelleyBalances.rewardsAccountBalance as Lovelace
    const stakingAddress = getSourceAccountInfo(state).stakingAddress
    const txPlanResult = await prepareTxPlan({rewards, stakingAddress, txType: TxType.WITHDRAW})
    // TODO: balance should be of type Lovelace
    const balance = getSourceAccountInfo(state).balance as Lovelace

    if (txPlanResult.success === true) {
      const withdrawTransactionSummary: WithdrawTransactionSummary = {
        type: TxType.WITHDRAW,
        rewards,
      }
      setTransactionSummary(txPlanResult.txPlan, withdrawTransactionSummary)
      await confirmTransaction(getState(), 'withdraw')
    } else {
      const withdrawalValidationError =
        withdrawalPlanValidator(rewards, balance, txPlanResult.estimatedFee) ||
        getWallet().ensureFeatureIsSupported(CryptoProviderFeature.WITHDRAWAL) ||
        txPlanResult.error
      setError(state, {
        errorName: 'transactionSubmissionError',
        error: withdrawalValidationError,
      })
      setState({shouldShowTransactionErrorModal: true})
    }
    stopLoadingAction(state)
  }

  return {
    calculateFee,
    updateAddress,
    updateAmount,
    sendMaxFunds,
    convertNonStakingUtxos,
    withdrawRewards,
  }
}
