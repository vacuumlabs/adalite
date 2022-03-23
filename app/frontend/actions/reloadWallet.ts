import {State, Store} from '../state'
import errorActions from './error'
import commonActions from './common'
import walletActions, {getWallet} from './wallet'
import sleep from '../helpers/sleep'
import {getDateDiffInSeconds} from '../helpers/common'
import * as assert from 'assert'

export default (store: Store) => {
  const {setError} = errorActions(store)
  const {loadAsyncWalletData, getShouldShowSaturatedBanner} = walletActions(store)
  const {setState} = store
  const {setWalletOperationStatusType} = commonActions(store)

  let _lastWalletReloadTime = new Date(0)
  const setLastReloadTime = (time: Date) => {
    _lastWalletReloadTime = time
  }
  const updateLastReloadTime = () => {
    const currentTime = new Date()
    setLastReloadTime(currentTime)
  }

  const reloadWalletInfo = async (state: State): Promise<void> => {
    setWalletOperationStatusType(state, 'reloading')
    const wallet = getWallet()

    // submitting transaction and not clearing cache can cause stale values
    // user would see old balance and history, but UTXOs for planning would be up to date
    // we are interested only in caching for the sake of not fetching
    // multiple requestests within context of related requests
    wallet.invalidateCache()

    const previousWalletReloadTime = _lastWalletReloadTime
    try {
      updateLastReloadTime()
      assert(state.validStakepoolDataProvider != null)
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
      setLastReloadTime(previousWalletReloadTime)
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
