import {Stakepool} from '../../../frontend/types'

export type StakepoolDataProvider = {
  getPoolInfoByTicker: (ticker: string) => Stakepool
  getPoolInfoByPoolHash: (poolHash: string) => Stakepool
  hasTickerMapping: boolean
}

export type AssetDataProvider = {
  isADA: boolean
  isToken: boolean
  getTokenPolicyId: () => string
  getTokenAssetName: () => string
}
