import {State, Store} from '../state'
import errorActions from './error'
import commonActions from './common'
import walletActions, {getWallet} from './wallet'
import sleep from '../helpers/sleep'
import {getDateDiffInSeconds} from '../helpers/common'

export default (store: Store) => {
  const {setError} = errorActions(store)
  const {loadAsyncWalletData, getShouldShowSaturatedBanner} = walletActions(store)
  const {setState} = store
  const {setWalletOperationStatusType} = commonActions(store)

  const wallet = getWallet()
  let _lastWalletReloadTime = new Date(0)
  const updateLastReloadTime = () => {
    const currentTime = new Date()
    _lastWalletReloadTime = currentTime
  }

  const reloadWalletInfo = async (state: State): Promise<void> => {
    setWalletOperationStatusType(state, 'reloading')
    try {
      updateLastReloadTime()
      const accountsInfo = await wallet.getAccountsInfo(state.validStakepoolDataProvider)
      const tokensMetadata = await wallet.getTokensMetadata(accountsInfo)

      setState({
        accountsInfo,
        tokensMetadata,
        shouldShowSaturatedBanner: getShouldShowSaturatedBanner(accountsInfo),
      })
      loadAsyncWalletData()

      // timeout setting loading state, so that loading shows even if everything was cached
      await sleep(500)
      if (state.walletOperationStatusType !== 'txPending') {
        setWalletOperationStatusType(state, null)
      }
    } catch (e) {
      setWalletOperationStatusType(state, 'reloadFailed')
      setError(state, {errorName: 'walletLoadingError', error: e})
      setState({
        shouldShowWalletLoadingErrorModal: true,
      })
    }
  }

  const debouncedReloadWalletInfo = async (state: State) => {
    const currentTime = new Date()
    if (getDateDiffInSeconds(_lastWalletReloadTime, currentTime) < 30) {
      setWalletOperationStatusType(state, 'reloading')
      await sleep(2000) // fake loading
      setWalletOperationStatusType(state, null)
    } else {
      await reloadWalletInfo(state)
    }
  }

  return {
    reloadWalletInfo,
    debouncedReloadWalletInfo,
  }
}
