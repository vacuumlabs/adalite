import {Store, State} from '../state'
import {getWallet} from './wallet'
import errorActions from './error'
import {usingHwWalletSelector} from '../selectors'

export default (store: Store) => {
  const {setState, getState} = store
  const {setError} = errorActions(store)

  const verifyAddress = async (state: State, address?: string) => {
    const newState = getState()
    if (usingHwWalletSelector(newState)) {
      try {
        setState({
          waitingForHwWallet: true,
          addressVerificationError: false,
        })
        const addressToVerify = address || newState.showAddressDetail?.address
        if (addressToVerify) {
          await getWallet()
            .getAccount(state.targetAccountIndex)
            .verifyAddress(addressToVerify)
        }
        setState({
          waitingForHwWallet: false,
        })
      } catch (e) {
        setState({
          waitingForHwWallet: false,
        })
        setError(state, {errorName: 'addressVerificationError', error: true})
      }
    }
  }

  return {
    verifyAddress,
  }
}
