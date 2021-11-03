import {Store, State} from '../state'
import {getWallet} from './wallet'
import loadingActions from './loading'
import errorActions from './error'
import {CryptoProviderFeature, TxType} from '../types'
import debugLog from '../helpers/debugLog'
import {
  parseCliUnsignedTx,
  parsePoolRegTxFile,
} from '../wallet/shelley/helpers/stakepoolRegistrationUtils'
import {InternalError, InternalErrorReason} from '../errors'
import {usingHwWalletSelector} from '../selectors'

export default (store: Store) => {
  const {setState} = store
  const {setError} = errorActions(store)
  const {loadingAction, stopLoadingAction} = loadingActions(store)

  const loadPoolCertificateTx = async (state: State, fileContentStr: string) => {
    try {
      loadingAction(state, 'Loading pool registration certificate...')
      setState({poolRegTxError: undefined})
      const {cborHex, txBodyType} = parsePoolRegTxFile(fileContentStr)
      const {unsignedTxParsed, ttl, validityIntervalStart} = parseCliUnsignedTx(cborHex)
      const txPlan =
        (await getWallet()
          .getAccount(state.activeAccountIndex)
          .getPoolRegistrationTxPlan({txType: TxType.POOL_REG_OWNER, unsignedTxParsed})) || null
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
      if (supportError) {
        throw new InternalError(supportError.code, {message: supportError.params.message})
      }
      if (usingHwWalletSelector(state)) {
        setState({waitingForHwWallet: true})
        loadingAction(state, `Waiting for ${state.hwWalletName}...`)
      } else {
        throw new InternalError(InternalErrorReason.PoolRegNoHwWallet)
      }

      const {plan, ttl, validityIntervalStart} = state.poolRegTransactionSummary
      const wallet = getWallet()
      if (plan && ttl && validityIntervalStart) {
        const txAux = await wallet
          .getAccount(state.sourceAccountIndex)
          .prepareTxAux(plan, ttl, validityIntervalStart)
        const witness = await wallet.getAccount(state.sourceAccountIndex).witnessPoolRegTxAux(txAux)
        setState({
          poolRegTransactionSummary: {
            ...state.poolRegTransactionSummary,
            shouldShowPoolCertSignModal: false,
            witness,
          },
        })
      }
    } catch (e) {
      debugLog(`Certificate transaction file signing failure: ${e}`)
      resetPoolRegTransactionSummary(state)
      setError(state, {errorName: 'poolRegTxError', error: e})
    } finally {
      stopLoadingAction(state)
    }
  }

  return {
    loadPoolCertificateTx,
    openPoolRegTransactionModal,
    closePoolRegTransactionModal,
    signPoolCertificateTx,
    resetPoolRegTransactionSummary,
  }
}
