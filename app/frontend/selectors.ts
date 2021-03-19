import {useSelector} from './helpers/connect'
import {getActiveAccountInfo} from './state'
import {AccountInfo} from './types'

/*
This file contains hooks shared accross multiple components which
use global state to infer return values.
Once "actions.ts" is divided into multiple files consider to also divide this file.
*/

export const useActiveAccount = () => useSelector((state) => getActiveAccountInfo(state))

export const hasStakingKey = (account: AccountInfo) => account.shelleyAccountInfo.hasStakingKey

export const useIsActiveAccountDelegating = (): boolean => {
  const activeAccount = useActiveAccount()
  const pool = activeAccount.shelleyAccountInfo.delegation
  return hasStakingKey(activeAccount) && Object.keys(pool).length > 0
}
