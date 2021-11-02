import {Store, State, getSourceAccountInfo} from '../state'
import {
  CryptoProviderFeature,
  HexString,
  Lovelace,
  TxType,
  VotingRegistrationTransactionSummary,
} from '../types'
import transactionActions from './transaction'
import loadingActions from './loading'
import commonActions from './common'
import {getWalletOrThrow} from './wallet'
import errorActions from './error'
import {txPlanValidator} from '../helpers/validators'
import {xpub2pub} from '../wallet/shelley/helpers/addresses'
import {TxPlanResult, isTxPlanResultSuccess} from '../wallet/shelley/transaction/types'
import {InternalErrorReason} from '../errors'

export default (store: Store) => {
  const {setState, getState} = store
  const {loadingAction, stopLoadingAction} = loadingActions(store)
  const {confirmTransaction} = transactionActions(store)
  const {setError} = errorActions(store)
  const {prepareTxPlan, setTransactionSummary} = commonActions(store)

  const openVotingDialog = (state: State) => {
    setState({
      shouldShowVotingDialog: true,
      txSuccessTab: '',
    })
  }

  const closeVotingDialog = (state: State) => {
    setState({
      shouldShowVotingDialog: false,
    })
  }

  const registerVotingKey = async (
    state: State,
    {votingPubKey}: {votingPubKey: HexString}
  ): Promise<void> => {
    const supportError = getWalletOrThrow().ensureFeatureIsSupported(CryptoProviderFeature.VOTING)
    if (supportError) {
      setError(state, {
        errorName: 'transactionSubmissionError',
        error: supportError,
      })
      setState({
        shouldShowTransactionErrorModal: true,
        shouldShowVotingDialog: false,
      })
      return
    }
    loadingAction(state, 'Preparing transaction...')
    state = getState()

    const stakePubKey = xpub2pub(
      Buffer.from(getSourceAccountInfo(state).stakingXpub?.xpubHex || '', 'hex')
    ).toString('hex')
    const nonce =
      (await getWalletOrThrow()
        .getAccount(state.sourceAccountIndex)
        .calculateTtl()) || ''
    const sourceAccount = getSourceAccountInfo(state)
    let txPlanResult: TxPlanResult | null | undefined = null
    if (sourceAccount.stakingAddress) {
      txPlanResult = await prepareTxPlan({
        txType: TxType.REGISTER_VOTING,
        votingPubKey,
        stakePubKey,
        stakingAddress: sourceAccount.stakingAddress,
        nonce: BigInt(nonce),
      })
    }

    if (isTxPlanResultSuccess(txPlanResult)) {
      const summary = {
        type: TxType.REGISTER_VOTING,
      } as VotingRegistrationTransactionSummary

      setTransactionSummary(getState(), {
        plan: txPlanResult.txPlan,
        transactionSummary: summary,
      })
      await confirmTransaction(getState(), {
        sourceAccountIndex: sourceAccount.accountIndex,
        txPlan: txPlanResult.txPlan,
        txConfirmType: TxType.REGISTER_VOTING,
      })
    } else {
      const balance = getSourceAccountInfo(state).balance as Lovelace
      const validationError = (txPlanResult?.estimatedFee &&
        txPlanValidator(0 as Lovelace, 0 as Lovelace, balance, txPlanResult.estimatedFee)) ||
        txPlanResult?.error || {code: InternalErrorReason.Error, message: ''}
      setError(state, {
        errorName: 'transactionSubmissionError',
        error: validationError,
      })
      setState({
        shouldShowTransactionErrorModal: true,
        shouldShowVotingDialog: false,
      })
    }
    stopLoadingAction(state)
  }

  return {
    openVotingDialog,
    closeVotingDialog,
    registerVotingKey,
  }
}
