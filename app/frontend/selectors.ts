import {State, getActiveAccountInfo} from './state'
import {
  BIG_DELEGATOR_THRESHOLD,
  CATALYST_MIN_THRESHOLD,
  PREMIUM_MEMBER_BALANCE_TRESHOLD,
} from './wallet/constants'
import {useSelector} from './helpers/connect'
import {AccountInfo, AuthMethodType, CryptoProviderFeature} from './types'
import {CryptoProviderType} from './wallet/types'
import BigNumber from 'bignumber.js'

/*
This file contains hooks/selectors shared accross multiple components which
use global state to infer return values.
Once "actions.ts" is divided into multiple files consider to also divide this file.
*/

export const totalWalletBalanceSelector = (state: State): BigNumber =>
  state.accountsInfo.reduce((a, {balance}) => balance.plus(a), new BigNumber(0))

export const totalRewardsBalanceSelector = (state: State): BigNumber =>
  state.accountsInfo.reduce(
    (a, {shelleyBalances}) => shelleyBalances.rewardsAccountBalance.plus(a),
    new BigNumber(0)
  )

export const isBigDelegatorSelector = (state: State): boolean => {
  const totalWalletBalance = totalWalletBalanceSelector(state)
  return totalWalletBalance.gt(BIG_DELEGATOR_THRESHOLD)
}

export const shouldShowPremiumBannerSelector = (state: State): boolean => {
  const totalWalletBalance = totalWalletBalanceSelector(state)
  return !state.seenPremiumBanner && totalWalletBalance.gt(PREMIUM_MEMBER_BALANCE_TRESHOLD)
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

export const useIsWalletFeatureSupported = (feature: CryptoProviderFeature): boolean =>
  useSelector((state) => state.cryptoProviderInfo?.supportedFeatures.includes(feature) ?? false)

export const useGetCryptoProviderType = (): CryptoProviderType | undefined =>
  useSelector((state) => state.cryptoProviderInfo?.type)

export const useIsActiveAccountDelegating = (): boolean => {
  const activeAccount = useActiveAccount()
  const pool = activeAccount.shelleyAccountInfo.delegation
  return hasStakingKey(activeAccount) && Object.keys(pool).length > 0
}

export const useHasEnoughFundsForCatalyst = (): boolean => {
  const activeAccount = useActiveAccount()
  return activeAccount.balance.gt(CATALYST_MIN_THRESHOLD)
}
