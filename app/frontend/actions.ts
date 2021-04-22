import {Store} from './state'
import accountsActions from './actions/accounts'
import addressActions from './actions/address'
import commonActions from './actions/common'
import delegateActions from './actions/delegate'
import errorActions from './actions/error'
import generalActions from './actions/general'
import loadingActions from './actions/loading'
import mnemonicActions from './actions/mnemonic'
import poolOwnerActions from './actions/poolOwner'
import sendActions from './actions/send'
import transactionActions from './actions/transaction'
import walletActions from './actions/wallet'
import votingActions from './actions/voting'

export default (store: Store) => ({
  ...accountsActions(store),
  ...addressActions(store),
  ...commonActions(store),
  ...delegateActions(store),
  ...errorActions(store),
  ...generalActions(store),
  ...loadingActions(store),
  ...mnemonicActions(store),
  ...poolOwnerActions(store),
  ...sendActions(store),
  ...transactionActions(store),
  ...walletActions(store),
  ...votingActions(store),
})
