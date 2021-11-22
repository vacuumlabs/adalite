import {Stakepool} from '../../../frontend/types'

export type StakepoolDataProvider = {
  getPoolInfoByTicker: (ticker: string) => Stakepool | null
  getPoolInfoByPoolHash: (poolHash: string) => Stakepool | null
  hasTickerMapping: boolean
}
