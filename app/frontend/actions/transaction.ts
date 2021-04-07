import {Store, State} from '../state'
import walletActions, {getWallet} from './wallet'
import loadingActions from './loading'
import errorActions from './error'
import commonActions from './common'
import sleep from '../helpers/sleep'
import NamedError from '../helpers/NamedError'
import {MainTabs} from '../constants'
import getDonationAddress from '../helpers/getDonationAddress'
import {HexString, TxType} from '../types'
import {encode} from 'borc'

export default (store: Store) => {
  const {setState, getState} = store
  const {setError} = errorActions(store)
  const {loadingAction, stopLoadingAction} = loadingActions(store)
  const {reloadWalletInfo} = walletActions(store)
  const {
    resetTransactionSummary,
    resetSendFormState,
    resetSendFormFields,
    resetAccountIndexes,
  } = commonActions(store)

  const confirmTransaction = async (state: State, txConfirmType): Promise<void> => {
    let txAux
    const newState = getState()
    try {
      if (newState.sendTransactionSummary.plan) {
        txAux = await getWallet()
          .getAccount(state.sourceAccountIndex)
          .prepareTxAux(newState.sendTransactionSummary.plan)
      } else {
        loadingAction(state, 'Preparing transaction plan...')
        await sleep(1000) // wait for plan to be set in case of unfortunate timing
        const retriedState = getState()
        txAux = await getWallet()
          .getAccount(state.sourceAccountIndex)
          .prepareTxAux(retriedState.sendTransactionSummary.plan)
      }
    } catch (e) {
      throw NamedError('TransactionCorrupted', {causedBy: e})
    } finally {
      stopLoadingAction(state)
    }

    // TODO: implement tx differenciation here and drop the txConfirmType

    const isTxBetweenAccounts = state.activeMainTab === MainTabs.ACCOUNT && txConfirmType === 'send'
    // TODO: refactor
    const keepConfirmationDialogOpen =
      isTxBetweenAccounts ||
      txConfirmType === 'convert' ||
      txConfirmType === 'withdraw' ||
      txConfirmType === 'deregisterStakeKey'

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

  const waitForTxToAppearOnBlockchain = async (
    state: State,
    txHash: HexString,
    pollingInterval: number,
    maxRetries: number
  ) => {
    loadingAction(state, 'Transaction submitted - syncing wallet...')

    for (let pollingCounter = 0; pollingCounter < maxRetries; pollingCounter++) {
      if ((await getWallet().fetchTxInfo(txHash)) !== undefined) {
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
      const txAux = await getWallet()
        .getAccount(state.sourceAccountIndex)
        .prepareTxAux(state.sendTransactionSummary.plan)
      const signedTx = await getWallet()
        .getAccount(state.sourceAccountIndex)
        .signTxAux(txAux)

      if (state.usingHwWallet) {
        setState({waitingForHwWallet: false})
        loadingAction(state, 'Submitting transaction...')
      }
      txSubmitResult = await getWallet().submitTx(signedTx)

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
      setError(state, {
        errorName: 'transactionSubmissionError',
        error: e,
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
      getWallet()
        .getAccount(state.sourceAccountIndex)
        .generateNewSeeds()
      resetAccountIndexes(state)
      setState({
        waitingForHwWallet: false,
        // TODO: refactor txSuccesTab
        txSuccessTab:
          sendResponse && sendResponse.success && txTab === TxType.SEND_ADA ? 'send' : 'stake',
        sendResponse,
      })
    }
  }

  return {
    confirmTransaction,
    cancelTransaction,
    setRawTransactionOpen,
    closeTransactionErrorModal,
    submitTransaction,
  }
}
