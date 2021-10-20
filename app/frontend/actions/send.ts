import {Store, State, getSourceAccountInfo} from '../state'
import {getWallet} from './wallet'
import errorActions from './error'
import commonActions from './common'
import {
  sendAddressValidator,
  sendAmountValidator,
  tokenAmountValidator,
  txPlanValidator,
} from '../helpers/validators'
import {SendTransactionSummary, TxType, Lovelace, AssetFamily, Address, SendAmount} from '../types'
import debounceEvent from '../helpers/debounceEvent'
import {createTokenRegistrySubject} from '../tokenRegistry/tokenRegistry'

export default (store: Store) => {
  const {setState, getState} = store
  const {setError} = errorActions(store)
  const {resetTransactionSummary, setTransactionSummaryOld, prepareTxPlan} = commonActions(store)

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
      const decimals =
        getState().tokensMetadata.get(createTokenRegistrySubject(policyId, assetName))?.decimals ||
        0
      const sendAmountValidationError = tokenAmountValidator(
        state.sendAmount.fieldValue,
        quantity,
        tokenBalance,
        decimals
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
      setTransactionSummaryOld(txPlanResult.txPlan, sendTransactionSummary)
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
      sendAmount: Object.assign({}, state.sendAmount, sendAmount),
    })
    validateSendFormAndCalculateFee()
  }

  const validateAndSetMaxFunds = (state: State, maxAmount: SendAmount) => {
    // TODO: some special validation

    updateAmount(state, maxAmount)
  }

  const sendMaxFunds = async (state: State, decimals: number) => {
    setState({calculatingFee: true})
    try {
      const maxAmounts = await getWallet()
        .getAccount(state.sourceAccountIndex)
        .getMaxSendableAmount(state.sendAddress.fieldValue as Address, state.sendAmount, decimals)
      validateAndSetMaxFunds(state, maxAmounts)
    } catch (e) {
      setState({
        calculatingFee: false,
      })
      setError(state, {errorName: 'sendAmountValidationError', error: {code: e.name}})
      return
    }
  }

  return {
    calculateFee,
    updateAddress,
    updateAmount,
    sendMaxFunds,
  }
}
