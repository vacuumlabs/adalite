import {Store, State, getSourceAccountInfo} from '../state'
import {getWallet} from './wallet'
import reloadWalletActions from './reloadWallet'
import loadingActions from './loading'
import errorActions from './error'
import commonActions from './common'
import sleep from '../helpers/sleep'
import {MainTabs} from '../constants'
import getDonationAddress from '../helpers/getDonationAddress'
import {txPlanValidator, withdrawalPlanValidator} from '../helpers/validators'
import {
  HexString,
  TxType,
  SendTransactionSummary,
  WithdrawTransactionSummary,
  Lovelace,
  AssetFamily,
  CryptoProviderFeature,
  TransactionSummary,
} from '../types'
import {TxPlan} from '../wallet/shelley/transaction'
import {InternalError, InternalErrorReason} from '../errors'
import {TxSummary} from '../wallet/backend-types'
import * as assert from 'assert'
import {getDeviceBrandName, isHwWallet} from '../wallet/helpers/cryptoProviderUtils'
import {getChangeAddress} from '../wallet/account'
import BigNumber from 'bignumber.js'
import {encodeCbor} from '../wallet/helpers/cbor'

export default (store: Store) => {
  const {setState, getState} = store
  const {setError} = errorActions(store)
  const {loadingAction, stopLoadingAction} = loadingActions(store)
  const {reloadWalletInfo} = reloadWalletActions(store)
  const {
    resetTransactionSummary,
    resetSendFormFields,
    prepareTxPlan,
    setTransactionSummaryOld,
    resetAccountIndexes,
    setWalletOperationStatusType,
  } = commonActions(store)

  const resetSendFormState = (state: State) => {
    setState({
      shouldShowConfirmTransactionDialog: false,
    })
  }

  const _confirmTransaction = async (
    state: State,
    {
      txConfirmType,
      txPlan,
      sourceAccountIndex,
    }: {txConfirmType: TxType; txPlan: TxPlan; sourceAccountIndex: number}
  ): Promise<void> => {
    let txAux
    try {
      if (txPlan) {
        txAux = await getWallet().getAccount(sourceAccountIndex).prepareTxAux(txPlan)
      } else {
        loadingAction(state, 'Preparing transaction plan...')
        await sleep(1000) // wait for plan to be set in case of unfortunate timing
        const retriedState = getState()
        assert(retriedState.transactionSummary?.plan != null)
        txAux = await getWallet()
          .getAccount(sourceAccountIndex)
          .prepareTxAux(retriedState.transactionSummary.plan)
      }
    } catch (e) {
      throw new InternalError(InternalErrorReason.TransactionCorrupted, {causedBy: e})
    } finally {
      stopLoadingAction(state)
    }

    /*
    REFACTOR:
    Drop: `keepConfirmationDialogOpen, isCrossAccount` as those values can
    be inferred
    */

    const isTxBetweenAccounts =
      state.activeMainTab === MainTabs.ACCOUNT && txConfirmType === TxType.SEND_ADA

    const keepConfirmationDialogOpen =
      isTxBetweenAccounts ||
      txConfirmType === TxType.CONVERT_LEGACY ||
      txConfirmType === TxType.WITHDRAW ||
      txConfirmType === TxType.DEREGISTER_STAKE_KEY ||
      txConfirmType === TxType.REGISTER_VOTING

    setState({
      shouldShowConfirmTransactionDialog: true,
      txConfirmType,
      isCrossAccount: isTxBetweenAccounts,
      keepConfirmationDialogOpen,
      // TODO: maybe do this only on demand
      rawTransaction: Buffer.from(encodeCbor(txAux)).toString('hex'),
      rawTransactionOpen: false,
    })
  }

  const confirmTransaction = async (
    state: State,
    {
      txConfirmType,
      txPlan,
      sourceAccountIndex,
    }: {txConfirmType: TxType; txPlan: TxPlan; sourceAccountIndex: number}
  ): Promise<void> => {
    return await _confirmTransaction(state, {txConfirmType, txPlan, sourceAccountIndex})
  }

  const confirmTransactionOld = async (state: State, txConfirmType: TxType): Promise<void> => {
    const txPlan = state.transactionSummary?.plan
    const {sourceAccountIndex} = state
    assert(txPlan != null)
    return await _confirmTransaction(state, {txConfirmType, txPlan, sourceAccountIndex})
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

  const waitForTxToAppearOnBlockchain = async (
    state: State,
    txHash: HexString,
    pollingInterval: number,
    maxRetries: number
  ) => {
    for (let pollingCounter = 0; pollingCounter < maxRetries; pollingCounter++) {
      setWalletOperationStatusType(state, 'txPending')
      let txInfo: TxSummary | undefined
      try {
        txInfo = await getWallet().fetchTxInfo(txHash)
        // eslint-disable-next-line no-empty
      } catch {}
      if (txInfo !== undefined) {
        /*
         * theoretically we should clear the request cache of the wallet
         * to be sure that we fetch the current wallet state
         * but submitting the transaction and syncing of the explorer
         * should take enough time to invalidate the request cache anyway
         */
        await reloadWalletInfo(state)
        setWalletOperationStatusType(state, 'txSuccess')
        return {
          success: true,
          txHash,
        }
      } else {
        await sleep(pollingInterval)
      }
    }
    throw new InternalError(InternalErrorReason.TransactionNotFoundInBlockchainAfterSubmission)
  }

  const getTxSuccessTabMapping = (txTab: TxType): string => {
    switch (txTab) {
      case TxType.SEND_ADA:
        return 'send'
      case TxType.REGISTER_VOTING:
        return 'voting'
      default:
        // preserves past functionality, needs refactor
        return 'stake'
    }
  }

  const submitTransaction = async (
    state: State,
    {
      txSummary,
      sourceAccountIndex,
      sendAddress,
    }: {txSummary: TransactionSummary; sourceAccountIndex: number; sendAddress: string}
  ) => {
    const {keepConfirmationDialogOpen, cryptoProviderInfo} = state
    const cryptoProviderType = cryptoProviderInfo?.type
    setState({
      shouldShowSendTransactionModal: false,
      shouldShowDelegationModal: false,
    })
    if (!keepConfirmationDialogOpen) {
      setState({
        shouldShowConfirmTransactionDialog: false,
      })
    }
    if (isHwWallet(cryptoProviderType)) {
      setState({waitingHwWalletOperation: 'transaction'})
      loadingAction(state, `Waiting for ${getDeviceBrandName(cryptoProviderType)}...`)
    } else {
      setWalletOperationStatusType(state, 'txSubmitting')
    }
    const txTab = txSummary.type
    let sendResponse
    try {
      assert(txSummary.plan != null)
      const txAux = await getWallet().getAccount(sourceAccountIndex).prepareTxAux(txSummary.plan)
      const signedTx = await getWallet().getAccount(sourceAccountIndex).signTxAux(txAux)
      if (isHwWallet(cryptoProviderType)) {
        setState({waitingHwWalletOperation: null})
        stopLoadingAction(state)
        setWalletOperationStatusType(state, 'txSubmitting')
      }
      const txSubmitResult = await getWallet().submitTx(signedTx, txSummary.type)

      closeConfirmationDialog(state)
      resetTransactionSummary(state)
      resetSendFormFields(state)
      resetSendFormState(state)
      resetAccountIndexes(state)

      const didDonate = sendAddress === getDonationAddress()
      closeConfirmationDialog(state)
      if (didDonate) {
        setState({shouldShowThanksForDonation: true})
      }

      sendResponse = await waitForTxToAppearOnBlockchain(state, txSubmitResult.txHash, 5000, 360)
    } catch (e) {
      setError(state, {
        errorName: 'transactionSubmissionError',
        error: e,
      })
      setState({
        shouldShowVotingDialog: false,
        shouldShowTransactionErrorModal: true,
      })

      closeConfirmationDialog(state)
      resetTransactionSummary(state)
      resetSendFormFields(state)
      resetSendFormState(state)
      resetAccountIndexes(state)
      await reloadWalletInfo(state)
      setWalletOperationStatusType(state, 'txFailed')
    } finally {
      setState({
        waitingHwWalletOperation: null,
        // TODO: refactor txSuccesTab!
        txSuccessTab: sendResponse && sendResponse.success ? getTxSuccessTabMapping(txTab) : '',
      })
      stopLoadingAction(state)
    }
  }

  const convertNonStakingUtxos = async (state: State): Promise<void> => {
    loadingAction(state, 'Preparing transaction...')
    const address = getChangeAddress(getSourceAccountInfo(state))
    const sendAmount = await getWallet()
      .getAccount(state.sourceAccountIndex)
      // TODO: we should pass something more sensible
      .getMaxNonStakingAmount(getSourceAccountInfo(state).utxos, address, {
        assetFamily: AssetFamily.ADA,
        fieldValue: '',
        coins: new BigNumber(0) as Lovelace,
      })
    const coins =
      sendAmount.assetFamily === AssetFamily.ADA ? sendAmount.coins : (new BigNumber(0) as Lovelace)
    const txPlanResult = prepareTxPlan({
      address,
      sendAmount,
      txType: TxType.CONVERT_LEGACY,
    })
    const balance = getSourceAccountInfo(state).balance as Lovelace

    if (txPlanResult.success === true) {
      const transactionSummary: SendTransactionSummary = {
        type: TxType.SEND_ADA,
        address,
        coins,
        token: null,
        minimalLovelaceAmount: new BigNumber(0) as Lovelace,
      }
      setTransactionSummaryOld(txPlanResult.txPlan, transactionSummary)
      await confirmTransactionOld(getState(), TxType.CONVERT_LEGACY)
    } else {
      const validationError =
        txPlanValidator(coins, new BigNumber(0) as Lovelace, balance, txPlanResult.estimatedFee) ||
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
    const hasVoteDelegation = getSourceAccountInfo(state).shelleyAccountInfo.hasVoteDelegation
    const txPlanResult = prepareTxPlan({
      rewards,
      stakingAddress,
      hasVoteDelegation,
      txType: TxType.WITHDRAW,
    })
    // TODO: balance should be of type Lovelace
    const balance = getSourceAccountInfo(state).balance as Lovelace

    if (txPlanResult.success === true) {
      const withdrawTransactionSummary: WithdrawTransactionSummary = {
        type: TxType.WITHDRAW,
        rewards,
      }
      setTransactionSummaryOld(txPlanResult.txPlan, withdrawTransactionSummary)
      await confirmTransactionOld(getState(), TxType.WITHDRAW)
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
    confirmTransactionOld,
    confirmTransaction,
    cancelTransaction,
    setRawTransactionOpen,
    closeTransactionErrorModal,
    submitTransaction,
    convertNonStakingUtxos,
    withdrawRewards,
  }
}
