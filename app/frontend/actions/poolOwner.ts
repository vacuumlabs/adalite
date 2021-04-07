import {Store, State, getSourceAccountInfo} from '../state'
import {getWallet} from './wallet'
import loadingActions from './loading'
import errorActions from './error'
import transactionActions from './transaction'
import commonActions from './common'
import NamedError from '../helpers/NamedError'
import {
  CryptoProviderFeature,
  DeregisterStakingKeyTransactionSummary,
  Lovelace,
  TxType,
} from '../types'
import debugLog from '../helpers/debugLog'
import {withdrawalPlanValidator} from '../helpers/validators'
import {parseCliUnsignedTx} from '../wallet/shelley/helpers/stakepoolRegistrationUtils'

export default (store: Store) => {
  const {setState, getState} = store
  const {setError} = errorActions(store)
  const {loadingAction, stopLoadingAction} = loadingActions(store)
  const {confirmTransaction} = transactionActions(store)
  const {prepareTxPlan, setTransactionSummary} = commonActions(store)

  const loadPoolCertificateTx = async (state: State, fileContentStr: string) => {
    try {
      loadingAction(state, 'Loading pool registration certificate...')
      setState({poolRegTxError: undefined})
      const {txBodyType, unsignedTxParsed, ttl, validityIntervalStart} = parseCliUnsignedTx(
        fileContentStr
      )
      const txPlan = await getWallet()
        .getAccount(state.activeAccountIndex)
        .getPoolRegistrationTxPlan({txType: TxType.POOL_REG_OWNER, unsignedTxParsed})
      setState({
        poolRegTransactionSummary: {
          shouldShowPoolCertSignModal: false,
          ttl,
          validityIntervalStart,
          witness: null,
          plan: txPlan,
          txBodyType,
        },
      })
    } catch (err) {
      debugLog(`Certificate file parsing failure: ${err}`)
      setError(state, {
        errorName: 'poolRegTxError',
        error: {name: 'PoolRegTxParserError', message: err.message},
      })
    } finally {
      stopLoadingAction(state)
    }
  }

  const openPoolRegTransactionModal = (state: State) => {
    setState({
      poolRegTransactionSummary: {
        ...state.poolRegTransactionSummary,
        shouldShowPoolCertSignModal: true,
      },
    })
  }

  const closePoolRegTransactionModal = (state: State) => {
    setState({
      poolRegTransactionSummary: {
        ...state.poolRegTransactionSummary,
        shouldShowPoolCertSignModal: false,
      },
    })
  }

  const resetPoolRegTransactionSummary = (state: State) => {
    setState({
      poolRegTransactionSummary: {
        shouldShowPoolCertSignModal: false,
        ttl: null,
        validityIntervalStart: null,
        witness: null,
        plan: null,
        txBodyType: null,
      },
      poolRegTxError: null,
    })
  }

  const signPoolCertificateTx = async (state: State) => {
    try {
      // TODO: refactor feature support logic
      const supportError = getWallet().ensureFeatureIsSupported(CryptoProviderFeature.POOL_OWNER)
      if (supportError) throw NamedError(supportError.code, {message: supportError.params.message})
      if (state.usingHwWallet) {
        setState({waitingForHwWallet: true})
        loadingAction(state, `Waiting for ${state.hwWalletName}...`)
      } else {
        throw NamedError('PoolRegNoHwWallet')
      }

      const {plan, ttl, validityIntervalStart} = state.poolRegTransactionSummary

      const txAux = await getWallet()
        .getAccount(state.sourceAccountIndex)
        .prepareTxAux(plan, ttl, validityIntervalStart)
      const witness = await getWallet()
        .getAccount(state.sourceAccountIndex)
        .witnessPoolRegTxAux(txAux)

      setState({
        poolRegTransactionSummary: {
          ...state.poolRegTransactionSummary,
          shouldShowPoolCertSignModal: false,
          witness,
        },
      })
    } catch (e) {
      debugLog(`Certificate transaction file signing failure: ${e}`)
      resetPoolRegTransactionSummary(state)
      setError(state, {errorName: 'poolRegTxError', error: e})
    } finally {
      stopLoadingAction(state)
    }
  }

  const deregisterStakingKey = async (state: State): Promise<void> => {
    const supportError = getWallet().ensureFeatureIsSupported(CryptoProviderFeature.WITHDRAWAL)
    if (supportError) {
      setError(state, {
        errorName: 'transactionSubmissionError',
        error: supportError,
      })
      setState({shouldShowTransactionErrorModal: true})
      return
    }

    state = getState()
    const sourceAccount = getSourceAccountInfo(state)
    const rewards = getSourceAccountInfo(state).shelleyBalances.rewardsAccountBalance as Lovelace
    const balance = getSourceAccountInfo(state).balance as Lovelace

    loadingAction(state, 'Preparing transaction...')

    const txPlanResult = await prepareTxPlan({
      txType: TxType.DEREGISTER_STAKE_KEY,
      rewards,
      stakingAddress: sourceAccount.stakingAddress,
    })
    if (txPlanResult.success === true) {
      const summary = {
        type: TxType.DEREGISTER_STAKE_KEY,
        deposit: txPlanResult.txPlan.deposit,
        rewards,
      } as DeregisterStakingKeyTransactionSummary

      setTransactionSummary(txPlanResult.txPlan, summary)
      await confirmTransaction(getState(), 'deregisterStakeKey')
    } else {
      // Handled the same way as for withdrawal
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
    loadPoolCertificateTx,
    openPoolRegTransactionModal,
    closePoolRegTransactionModal,
    signPoolCertificateTx,
    resetPoolRegTransactionSummary,
    deregisterStakingKey,
  }
}
