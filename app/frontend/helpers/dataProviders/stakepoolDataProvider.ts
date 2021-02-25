import {StakePoolInfo, StakePoolInfosByPoolHash} from '../../../frontend/wallet/backend-types'
import {Stakepool} from '../../../frontend/types'
import {StakepoolDataProvider} from './types'

const createStakepoolDataProvider = (
  validStakepools: StakePoolInfosByPoolHash
): StakepoolDataProvider => {
  const [tickerMapping, poolHashMapping] = Object.entries(validStakepools).reduce(
    ([tickerMapping, poolHashMapping], entry) => {
      const [key, value]: [string, StakePoolInfo] = entry
      const stakepool = {
        ...value,
        poolHash: key,
      }
      if (stakepool.ticker) tickerMapping[stakepool.ticker] = stakepool
      if (stakepool.poolHash) poolHashMapping[stakepool.poolHash] = stakepool
      return [tickerMapping, poolHashMapping]
    },
    [{}, {}]
  )

  const getPoolInfoByTicker = (ticker: string): Stakepool => tickerMapping[ticker]
  const getPoolInfoByPoolHash = (poolHash: string): Stakepool => poolHashMapping[poolHash]
  const hasTickerMapping = Object.keys(tickerMapping).length !== 0

  return {
    getPoolInfoByTicker,
    getPoolInfoByPoolHash,
    hasTickerMapping,
  }
}

export {createStakepoolDataProvider}
