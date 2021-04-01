import {State, getActiveAccountInfo} from './state'
import {BIG_DELEGATOR_THRESHOLD, PREMIUM_MEMBER_BALANCE_TRESHOLD} from './wallet/constants'
import {useSelector} from './helpers/connect'
import {AccountInfo, AuthMethodType} from './types'

/*
This file contains hooks/selectors shared accross multiple components which
use global state to infer return values.
Once "actions.ts" is divided into multiple files consider to also divide this file.
*/

export const totalWalletBalanceSelector = (state: State): number =>
  state.accountsInfo.reduce((a, {balance}) => balance + a, 0)

export const totalRewardsBalanceSelector = (state: State): number =>
  state.accountsInfo.reduce((a, {shelleyBalances}) => shelleyBalances.rewardsAccountBalance + a, 0)

export const isBigDelegatorSelector = (state: State): boolean => {
  const totalWalletBalance = totalWalletBalanceSelector(state)
  return totalWalletBalance > BIG_DELEGATOR_THRESHOLD
}

export const shouldShowPremiumBannerSelector = (state: State): boolean => {
  const totalWalletBalance = totalWalletBalanceSelector(state)
  return !state.seenPremiumBanner && PREMIUM_MEMBER_BALANCE_TRESHOLD < totalWalletBalance
}

export const shouldShowExportOptionSelector = (state: State): boolean => {
  const {authMethod} = state
  return authMethod === AuthMethodType.MNEMONIC || authMethod === AuthMethodType.KEY_FILE
}

/*
TODO: decide where to keep such hooks & utils which are not really "selectors".
As we are "in-the-middle-of-refactor", it is kept there.
*/
export const useActiveAccount = (): AccountInfo =>
  useSelector((state) => getActiveAccountInfo(state))

export const hasStakingKey = (account: AccountInfo): boolean =>
  account.shelleyAccountInfo.hasStakingKey

export const useIsActiveAccountDelegating = (): boolean => {
  const activeAccount = useActiveAccount()
  const pool = activeAccount.shelleyAccountInfo.delegation
  return hasStakingKey(activeAccount) && Object.keys(pool).length > 0
}
