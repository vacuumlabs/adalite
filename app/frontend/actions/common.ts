import {State, Store} from '../state'
import {getWallet} from './wallet'
import {
  AssetFamily,
  DelegateTransactionSummary,
  DeregisterStakingKeyTransactionSummary,
  WalletOperationStatusType,
  Lovelace,
  SendTransactionSummary,
  TxPlanArgs,
  TxType,
  VotingRegistrationTransactionSummary,
  WithdrawTransactionSummary,
} from '../types'
import {TxPlan, TxPlanResult} from '../wallet/shelley/transaction'
import {InternalErrorReason} from '../errors'

export default (store: Store) => {
  const {setState, getState} = store

  const resetTransactionSummary = (state: State) => {
    setState({
      // Refactor: remove when `setTransactionSummaryOld` will not exist
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
      // TODO: this can be smarter, dummy reset for now
      cachedTransactionSummaries: {},
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
        e.name !== InternalErrorReason.NetworkError &&
        e.name !== InternalErrorReason.ServerError &&
        e.name !== InternalErrorReason.EpochBoundaryUnderway &&
        e.name !== InternalErrorReason.TxTooBig &&
        e.name !== InternalErrorReason.OutputTooBig
      ) {
        throw e
      }
      return {
        success: false,
        estimatedFee: 0 as Lovelace,
        minimalLovelaceAmount: 0 as Lovelace,
        deposit: 0 as Lovelace,
        error: {code: e.name},
      }
    }
  }

  // Refactor: remove once not used
  const setTransactionSummaryOld = (
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

  // Refactor: remove once not used
  const setTransactionSummary = (
    state: State,
    {
      plan,
      transactionSummary,
    }: {
      plan: TxPlan
      transactionSummary:
        | SendTransactionSummary
        | WithdrawTransactionSummary
        | DelegateTransactionSummary
        | DeregisterStakingKeyTransactionSummary
        | VotingRegistrationTransactionSummary
    }
  ) => {
    setState({
      cachedTransactionSummaries: {
        ...state.cachedTransactionSummaries,
        [transactionSummary.type]: {
          ...transactionSummary,
          fee: plan.fee,
          plan,
        },
      },
    })
  }

  const resetAccountIndexes = (state: State) => {
    setState({
      targetAccountIndex: state.activeAccountIndex,
      sourceAccountIndex: state.activeAccountIndex,
    })
  }

  const setWalletOperationStatusType = (state: State, type: WalletOperationStatusType) => {
    return setState({
      walletOperationStatusType: type,
    })
  }

  const resetWalletOperationStatusType = (state: State) => {
    return setState({
      walletOperationStatusType: null,
    })
  }

  return {
    resetTransactionSummary,
    resetSendFormFields,
    prepareTxPlan,
    setTransactionSummary,
    setTransactionSummaryOld,
    resetAccountIndexes,
    resetWalletOperationStatusType,
    setWalletOperationStatusType,
  }
}
