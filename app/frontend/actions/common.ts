import {State, Store} from '../state'
import {getWallet} from './wallet'
import {
  AssetFamily,
  DelegateTransactionSummary,
  DeregisterStakingKeyTransactionSummary,
  Lovelace,
  SendTransactionSummary,
  TxPlanArgs,
  TxType,
  WithdrawTransactionSummary,
} from '../types'
import {TxPlan, TxPlanResult} from '../wallet/shelley/shelley-transaction-planner'

export default (store: Store) => {
  const {setState, getState} = store

  const resetTransactionSummary = (state: State) => {
    setState({
      sendTransactionSummary: {
        // TODO: we should reset this to null
        type: TxType.SEND_ADA,
        address: null,
        coins: 0 as Lovelace,
        token: null,
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

  const prepareTxPlan = async (args: TxPlanArgs): Promise<TxPlanResult> => {
    const state = getState()
    try {
      return await getWallet()
        .getAccount(state.sourceAccountIndex)
        .getTxPlan(args)
    } catch (e) {
      // TODO: refactor setErrorState to check all errors if there unexpected
      if (
        e.name !== 'NetworkError' &&
        e.name !== 'ServerError' &&
        e.name !== 'TxTooBig' &&
        e.name !== 'OutputTooBig'
      ) {
        throw e
      }
      return {
        success: false,
        estimatedFee: 0 as Lovelace,
        minimalLovelaceAmount: 0 as Lovelace,
        error: {code: e.name},
      }
    }
  }

  const setTransactionSummary = (
    plan: TxPlan,
    transactionSummary:
      | SendTransactionSummary
      | WithdrawTransactionSummary
      | DelegateTransactionSummary
      | DeregisterStakingKeyTransactionSummary
  ) => {
    setState({
      sendTransactionSummary: {
        ...transactionSummary,
        fee: plan.fee,
        plan,
      },
    })
  }

  const resetAccountIndexes = (state: State) => {
    setState({
      targetAccountIndex: state.activeAccountIndex,
      sourceAccountIndex: state.activeAccountIndex,
    })
  }

  return {
    resetTransactionSummary,
    resetSendFormState,
    resetSendFormFields,
    prepareTxPlan,
    setTransactionSummary,
    resetAccountIndexes,
  }
}
