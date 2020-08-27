import request from './helpers/request'
import range from './helpers/range'
import NamedError from '../helpers/NamedError'
import debugLog from '../helpers/debugLog'
import getHash from '../helpers/getHash'
import {
  DelegetionHistoryItemType,
  RewardWithdrawal,
  StakeDelegation,
  StakePool,
  StakingReward,
} from '../components/pages/delegations/delegationHistoryPage'
import distinct from '../helpers/distinct'
import {UNKNOWN_POOL_NAME} from './constants'

const cacheResults = (maxAge: number, cache_obj: Object = {}) => <T extends Function>(fn: T): T => {
  const wrapped = (...args) => {
    const hash = getHash(JSON.stringify(args))
    if (!cache_obj[hash] || cache_obj[hash].timestamp + maxAge < Date.now()) {
      cache_obj[hash] = {
        timestamp: Date.now(),
        data: fn(...args),
      }
    }
    return cache_obj[hash].data
  }

  return (wrapped as any) as T
}

const blockchainExplorer = (ADALITE_CONFIG) => {
  const gapLimit = ADALITE_CONFIG.ADALITE_GAP_LIMIT

  async function _fetchBulkAddressInfo(addresses) {
    const url = `${ADALITE_CONFIG.ADALITE_BLOCKCHAIN_EXPLORER_URL}/api/bulk/addresses/summary`
    const result = await request(url, 'POST', JSON.stringify(addresses), {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
    })
    return result.Right
  }

  const getAddressInfos = cacheResults(5000)(_fetchBulkAddressInfo)

  async function getTxHistory(addresses) {
    const transactions = []
    const chunks = range(0, Math.ceil(addresses.length / gapLimit))
    const cachedAddressInfos = (await Promise.all(
      chunks.map(async (index) => {
        const beginIndex = index * gapLimit
        return await getAddressInfos(addresses.slice(beginIndex, beginIndex + gapLimit))
      })
    )).reduce(
      (acc, elem) => {
        return {
          caTxList: [...acc.caTxList, ...elem.caTxList],
        }
      },
      {caTxList: []}
    )
    // create a deep copy of address infos since
    // we are mutating effect and fee
    const addressInfos = JSON.parse(JSON.stringify(cachedAddressInfos))
    addressInfos.caTxList.forEach((tx) => {
      transactions[tx.ctbId] = tx
    })

    for (const t of Object.values(transactions)) {
      let effect = 0 //effect on wallet balance accumulated
      for (const input of t.ctbInputs || []) {
        if (addresses.includes(input[0])) {
          effect -= +input[1].getCoin
        }
      }
      for (const output of t.ctbOutputs || []) {
        if (addresses.includes(output[0])) {
          effect += +output[1].getCoin
        }
      }
      t.effect = effect
    }
    return Object.values(transactions).sort((a, b) => b.ctbTimeIssued - a.ctbTimeIssued)
  }

  async function fetchTxInfo(txHash) {
    const url = `${ADALITE_CONFIG.ADALITE_BLOCKCHAIN_EXPLORER_URL}/api/txs/summary/${txHash}`
    const response = await request(url)

    return response.Right
  }

  async function fetchTxRaw(txId) {
    // eslint-disable-next-line no-undef
    const url = `${ADALITE_CONFIG.ADALITE_BLOCKCHAIN_EXPLORER_URL}/api/txs/raw/${txId}`
    const result = await request(url)
    return Buffer.from(result.Right, 'hex')
  }

  async function isSomeAddressUsed(addresses) {
    return (await getAddressInfos(addresses)).caTxNum > 0
  }

  // TODO: we should have an endpoint for this
  async function filterUsedAddresses(addresses: Array<String>) {
    const txHistory = await getTxHistory(addresses)
    const usedAddresses = new Set()
    txHistory.forEach((trx) => {
      ;(trx.ctbOutputs || []).forEach((output) => {
        usedAddresses.add(output[0])
      })
      ;(trx.ctbInputs || []).forEach((input) => {
        usedAddresses.add(input[0])
      })
    })

    return usedAddresses
  }

  async function getBalance(addresses) {
    const chunks = range(0, Math.ceil(addresses.length / gapLimit))
    const balance = (await Promise.all(
      chunks.map(async (index) => {
        const beginIndex = index * gapLimit
        return await getAddressInfos(addresses.slice(beginIndex, beginIndex + gapLimit))
      })
    )).reduce((acc, elem) => acc + parseInt(elem.caBalance.getCoin, 10), 0)
    return balance
  }

  async function submitTxRaw(txHash, txBody) {
    const token = ADALITE_CONFIG.ADALITE_BACKEND_TOKEN
    const response = await request(
      `${ADALITE_CONFIG.ADALITE_SERVER_URL}/api/txs/submit`,
      'POST',
      JSON.stringify({
        txHash,
        txBody,
      }),
      {
        'Content-Type': 'application/json',
        ...(token ? {token} : {}),
      }
    )
    if (!response.Right) {
      debugLog(`Unexpected tx submission response: ${JSON.stringify(response)}`)
      throw NamedError('ServerError')
    }

    return response.Right
  }

  async function fetchUnspentTxOutputs(addresses) {
    const chunks = range(0, Math.ceil(addresses.length / gapLimit))

    const url = `${ADALITE_CONFIG.ADALITE_BLOCKCHAIN_EXPLORER_URL}/api/bulk/addresses/utxo`
    const response = (await Promise.all(
      chunks.map(async (index) => {
        const beginIndex = index * gapLimit
        const response = await request(
          url,
          'POST',
          JSON.stringify(addresses.slice(beginIndex, beginIndex + gapLimit)),
          {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
          }
        )
        return response.Right
      })
    )).reduce((acc, cur) => acc.concat(cur), [])

    return response.map((elem) => {
      return {
        txHash: elem.cuId,
        address: elem.cuAddress,
        coins: parseInt(elem.cuCoins.getCoin, 10),
        outputIndex: elem.cuOutIndex,
      }
    })
  }

  async function getPoolInfo(url) {
    const response = await request(
      `${ADALITE_CONFIG.ADALITE_SERVER_URL}/api/poolMeta`,
      'POST',
      JSON.stringify({poolUrl: url}),
      {'Content-Type': 'application/json'}
    ).catch(() => {
      return {}
    })
    return response
  }

  async function getDelegationHistory(accountPubkeyHex, validStakepools) {
    // Urls
    const delegationsUrl = `https://explorer-staging.adalite.io/api/account/delegationHistory/${accountPubkeyHex}`
    // const rewardsUrl = `https://explorer-staging.adalite.io/api/account/rewardHistory/${accountPubkeyHex}`
    const withdrawalsUrl = `https://explorer-staging.adalite.io/api/account/withdrawalHistory/${accountPubkeyHex}`

    // Run requests in parallel
    const delegationsRequest = request(delegationsUrl).catch(() => [])
    // const rewardsRequest = request(rewardsUrl).catch(()=>[]
    const withdrawalsRequest = request(withdrawalsUrl).catch(() => [])

    // Await all
    const delegations = await delegationsRequest
    const rewards = [] //await rewardsRequest
    const withdrawals = await withdrawalsRequest

    const extractUrl = (poolHash) =>
      validStakepools[poolHash] ? validStakepools[poolHash].url : null

    const poolMetaUrls = distinct(
      [...delegations, ...rewards].map(({poolHash}) => extractUrl(poolHash))
    ).filter((x) => x != null)

    const metaUrlToPoolNameMap = (await Promise.all(
      poolMetaUrls.map((url: string) =>
        getPoolInfo(url).then((metaData) => ({url, name: metaData.name}))
      )
    )).reduce((map, {url, name}) => {
      map[url] = name
      return map
    }, {})

    const poolHashToPoolName = (poolHash) => {
      const poolName = metaUrlToPoolNameMap[extractUrl(poolHash)]
      return poolName || UNKNOWN_POOL_NAME
    }

    const parseStakePool = (delegationHistoryObject) => {
      const stakePool: StakePool = {
        id: delegationHistoryObject.poolHash,
        name: poolHashToPoolName(delegationHistoryObject.poolHash),
      }

      return stakePool
    }

    // Prepare delegations
    let oldPool: StakePool = null
    const parsedDelegations = delegations
      .map((delegation) => ({...delegation, time: new Date(delegation.time)}))
      .sort((a, b) => a.time.getTime() - b.time.getTime()) // sort by time, oldest first
      .map((delegation) => {
        const stakePool: StakePool = parseStakePool(delegation)
        const stakeDelegation: StakeDelegation = {
          type: DelegetionHistoryItemType.StakeDelegation,
          epoch: delegation.epochNo,
          dateTime: new Date(delegation.time),
          newStakePool: stakePool,
          oldStakePool: oldPool,
        }
        oldPool = stakePool

        return stakeDelegation
      })
      .reverse() // newest first

    // Prepare rewards
    const parsedRewards = rewards.map((reward) => {
      const stakingReward: StakingReward = {
        type: DelegetionHistoryItemType.StakingReward,
        epoch: reward.epochNo,
        dateTime: new Date(reward.time),
        reward: reward.amount,
        stakePool: parseStakePool(reward),
      }

      return stakingReward
    })

    // Prepare withdrawals
    const parsedWithdrawals = withdrawals.map((withdrawal) => {
      const rewardWithdrawal: RewardWithdrawal = {
        type: DelegetionHistoryItemType.RewardWithdrawal,
        epoch: withdrawal.epochNo,
        dateTime: new Date(withdrawal.time),
        credit: withdrawal.amount,
      }

      return rewardWithdrawal
    })

    return [...parsedDelegations, ...parsedRewards, ...parsedWithdrawals].sort(
      (a, b) => b.dateTime.getTime() - a.dateTime.getTime()
    ) // sort by time, newest first
  }

  return {
    getTxHistory,
    fetchTxRaw,
    fetchUnspentTxOutputs,
    isSomeAddressUsed,
    submitTxRaw,
    getBalance,
    fetchTxInfo,
    filterUsedAddresses,
    getPoolInfo,
    getDelegationHistory,
  }
}

export default blockchainExplorer
