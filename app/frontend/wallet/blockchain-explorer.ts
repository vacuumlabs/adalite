import request from './helpers/request'
import range from './helpers/range'
import NamedError from '../helpers/NamedError'
import debugLog from '../helpers/debugLog'
import getHash from '../helpers/getHash'
import {
  StakingHistoryItemType,
  RewardWithdrawal,
  StakeDelegation,
  StakePool,
  StakingReward,
  StakingKeyRegistration,
} from '../components/pages/delegations/stakingHistoryPage'
import distinct from '../helpers/distinct'
import {UNKNOWN_POOL_NAME} from './constants'
import {HexString, Lovelace} from '../types'
import {captureMessage} from '@sentry/browser'
import {
  BulkAddressesSummaryResponse,
  TxSummaryResponse,
  SubmitResponse,
  BulkAdressesUtxoResponse,
  HostedPoolMetadata,
  DelegationHistoryEntry,
  RewardsHistoryEntry,
  WithdrawalsHistoryEntry,
  StakeRegistrationHistoryEntry,
  NextRewardDetail,
  ValidStakePoolsMapping,
  NextRewardDetailsFormatted,
  RewardWithMetadata,
  PoolRecommendationResponse,
  StakingInfoResponse,
  BestSlotResponse,
} from './explorer-types'

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

  async function _fetchBulkAddressInfo(addresses: Array<string>) {
    const url = `${ADALITE_CONFIG.ADALITE_BLOCKCHAIN_EXPLORER_URL}/api/bulk/addresses/summary`
    const result: BulkAddressesSummaryResponse = await request(
      url,
      'POST',
      JSON.stringify(addresses),
      {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      }
    )
    // @ts-ignore (TODO, handle 'Left')
    return result.Right
  }

  const _getAddressInfos = cacheResults(5000)(_fetchBulkAddressInfo)

  async function getTxHistory(addresses: Array<string>) {
    const transactions = []
    const chunks = range(0, Math.ceil(addresses.length / gapLimit))
    const cachedAddressInfos = (await Promise.all(
      chunks.map(async (index) => {
        const beginIndex = index * gapLimit
        return await _getAddressInfos(addresses.slice(beginIndex, beginIndex + gapLimit))
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
      if (!t.ctbId) captureMessage(`Tx without hash: ${JSON.stringify(t)}`)
      t.fee = parseInt(t.fee, 10)
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

  async function fetchTxInfo(txHash: string) {
    const url = `${ADALITE_CONFIG.ADALITE_BLOCKCHAIN_EXPLORER_URL}/api/txs/summary/${txHash}`
    const response: TxSummaryResponse = await request(url)
    // @ts-ignore (TODO, handle 'Left')
    return response.Right
  }

  // TODO: delete, raw txs are no longer in the db sync database
  // TODO: remove tests for byron which use this
  async function fetchTxRaw(txId) {
    // eslint-disable-next-line no-undef
    const url = `${ADALITE_CONFIG.ADALITE_BLOCKCHAIN_EXPLORER_URL}/api/txs/raw/${txId}`
    const result = await request(url)
    return Buffer.from(result.Right, 'hex')
  }

  async function isSomeAddressUsed(addresses: Array<string>): Promise<boolean> {
    return (await _getAddressInfos(addresses)).caTxNum > 0
  }

  // TODO: we should have an endpoint for this
  async function filterUsedAddresses(addresses: Array<string>) {
    const txHistory = await getTxHistory(addresses)
    const usedAddresses = new Set<string>()
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

  async function getBalance(addresses: Array<string>) {
    const chunks = range(0, Math.ceil(addresses.length / gapLimit))
    const balance = (await Promise.all(
      chunks.map(async (index) => {
        const beginIndex = index * gapLimit
        return await _getAddressInfos(addresses.slice(beginIndex, beginIndex + gapLimit))
      })
    )).reduce((acc, elem) => acc + parseInt(elem.caBalance.getCoin, 10), 0)
    return balance
  }

  async function submitTxRaw(txHash, txBody, params) {
    const token = ADALITE_CONFIG.ADALITE_BACKEND_TOKEN
    const response: SubmitResponse = await request(
      `${ADALITE_CONFIG.ADALITE_SERVER_URL}/api/txs/submit`,
      'POST',
      JSON.stringify({
        txHash,
        txBody,
      }),
      {
        'Content-Type': 'application/json',
        ...params,
        ...(token ? {token} : {}),
      }
    )
    if (!('Right' in response)) {
      debugLog(`Unexpected tx submission response: ${JSON.stringify(response)}`)
      if (response.statusCode && response.statusCode === 400) {
        throw NamedError('TransactionRejectedByNetwork', {
          message: response.Left,
        })
      } else {
        throw NamedError('ServerError')
      }
    }

    return response.Right
  }

  async function fetchUnspentTxOutputs(addresses: Array<string>) {
    const chunks = range(0, Math.ceil(addresses.length / gapLimit))

    const url = `${ADALITE_CONFIG.ADALITE_BLOCKCHAIN_EXPLORER_URL}/api/bulk/addresses/utxo`
    const response = (await Promise.all(
      chunks.map(async (index) => {
        const beginIndex = index * gapLimit
        const response: BulkAdressesUtxoResponse = await request(
          url,
          'POST',
          JSON.stringify(addresses.slice(beginIndex, beginIndex + gapLimit)),
          {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
          }
        )
        // @ts-ignore (TODO, handle 'Left')
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

  async function getPoolInfo(url: string) {
    const response: HostedPoolMetadata = await request(
      `${ADALITE_CONFIG.ADALITE_SERVER_URL}/api/poolMeta`,
      'POST',
      JSON.stringify({poolUrl: url}),
      {'Content-Type': 'application/json'}
    ).catch(() => {
      return {}
    })
    return response
  }

  async function getStakingHistory(accountPubkeyHex, validStakepools) {
    // Urls
    const delegationsUrl = `${
      ADALITE_CONFIG.ADALITE_BLOCKCHAIN_EXPLORER_URL
    }/api/account/delegationHistory/${accountPubkeyHex}`
    const rewardsUrl = `${
      ADALITE_CONFIG.ADALITE_BLOCKCHAIN_EXPLORER_URL
    }/api/account/rewardHistory/${accountPubkeyHex}`
    const withdrawalsUrl = `${
      ADALITE_CONFIG.ADALITE_BLOCKCHAIN_EXPLORER_URL
    }/api/account/withdrawalHistory/${accountPubkeyHex}`
    const stakingKeyRegistrationUrl = `${
      ADALITE_CONFIG.ADALITE_BLOCKCHAIN_EXPLORER_URL
    }/api/account/stakeRegistrationHistory/${accountPubkeyHex}`

    const [delegations, rewards, withdrawals, stakingKeyRegistrations]: [
      Array<DelegationHistoryEntry>,
      Array<RewardsHistoryEntry>,
      Array<WithdrawalsHistoryEntry>,
      Array<StakeRegistrationHistoryEntry>
    ] = await Promise.all([
      request(delegationsUrl).catch(() => []),
      request(rewardsUrl).catch(() => []),
      request(withdrawalsUrl).catch(() => []),
      request(stakingKeyRegistrationUrl).catch(() => []),
    ])

    const extractUrl = (poolHash) =>
      validStakepools[poolHash] ? validStakepools[poolHash].url : null

    const poolMetaUrls = distinct(
      [...delegations, ...rewards].map(({poolHash}) => extractUrl(poolHash))
    ).filter((url) => url != null)

    const metaUrlToPoolNameMap = (await Promise.all(
      poolMetaUrls.map((url: string) =>
        getPoolInfo(url).then((metaData) => ({url, name: metaData.name}))
      )
    )).reduce((map, {url, name}) => {
      map[url] = name
      return map
    }, {})

    const poolHashToPoolName = (poolHash) =>
      metaUrlToPoolNameMap[extractUrl(poolHash)] || UNKNOWN_POOL_NAME

    const parseStakePool = (stakingHistoryObject): StakePool => ({
      id: stakingHistoryObject.poolHash,
      name: poolHashToPoolName(stakingHistoryObject.poolHash),
    })

    // Prepare delegations
    let oldPool: StakePool = null
    const parsedDelegations = delegations
      .map((delegation) => ({...delegation, time: new Date(delegation.time)}))
      .sort((a, b) => a.time.getTime() - b.time.getTime()) // sort by time, oldest first
      .map((delegation) => {
        const stakePool: StakePool = parseStakePool(delegation)
        const stakeDelegation: StakeDelegation = {
          type: StakingHistoryItemType.StakeDelegation,
          txHash: delegation.txHash,
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
        type: StakingHistoryItemType.StakingReward,
        epoch: reward.epochNo,
        dateTime: new Date(reward.time),
        forEpoch: reward.forDelegationInEpoch,
        reward: parseInt(reward.amount, 10) as Lovelace,
        stakePool: parseStakePool(reward),
      }

      return stakingReward
    })

    // Prepare withdrawals
    const parsedWithdrawals = withdrawals.map((withdrawal) => {
      const rewardWithdrawal: RewardWithdrawal = {
        type: StakingHistoryItemType.RewardWithdrawal,
        txHash: withdrawal.txHash,
        epoch: withdrawal.epochNo,
        dateTime: new Date(withdrawal.time),
        amount: parseInt(withdrawal.amount, 10) as Lovelace,
      }

      return rewardWithdrawal
    })

    // Prepare staking key registration
    const parsedStakingKeyRegistrations = stakingKeyRegistrations.map((registration) => {
      const stakingKeyRegistration: StakingKeyRegistration = {
        type: StakingHistoryItemType.StakingKeyRegistration,
        txHash: registration.txHash,
        epoch: registration.epochNo,
        dateTime: new Date(registration.time),
        action: registration.action,
        stakingKey: accountPubkeyHex,
      }

      return stakingKeyRegistration
    })

    return [
      ...parsedDelegations,
      ...parsedRewards,
      ...parsedWithdrawals,
      ...parsedStakingKeyRegistrations,
    ].sort((a, b) => b.dateTime.getTime() - a.dateTime.getTime()) // sort by time, newest first
  }

  async function getRewardDetails(
    nextRewardDetails: Array<NextRewardDetail>,
    currentDelegationPoolHash: string,
    validStakepools: ValidStakePoolsMapping,
    epochsToRewardDistribution: number
  ): Promise<NextRewardDetailsFormatted> {
    const nextRewardDetailsWithMetaData: Array<RewardWithMetadata> = await Promise.all(
      nextRewardDetails.map(async (nextRewardDetail: NextRewardDetail) => {
        const poolHash = nextRewardDetail.poolHash
        if (poolHash) {
          return {
            ...nextRewardDetail,
            distributionEpoch: nextRewardDetail.forEpoch + epochsToRewardDistribution,
            pool: validStakepools[poolHash]
              ? await getPoolInfo(validStakepools[poolHash].url).catch(() => UNKNOWN_POOL_NAME)
              : {name: UNKNOWN_POOL_NAME},
          }
        } else {
          return {
            ...nextRewardDetail,
            pool: {}, // TODO: why does this not have {name: UNKNOWN_POOL_NAME}?
          }
        }
      })
    )
    const sortedValidRewardDetails = nextRewardDetailsWithMetaData
      .filter((rewardDetail) => rewardDetail.poolHash != null)
      .sort((a, b) => a.forEpoch - b.forEpoch)
    const nearestRewardDetails = sortedValidRewardDetails[0]
    const currentDelegationRewardDetails = sortedValidRewardDetails.find(
      (rewardDetail) => rewardDetail.poolHash === currentDelegationPoolHash
    )

    return {
      upcoming: nextRewardDetailsWithMetaData,
      nearest: nearestRewardDetails,
      currentDelegation: currentDelegationRewardDetails,
    }
  }

  function getPoolRecommendation(
    poolHash: string,
    stakeAmount: Lovelace
  ): Promise<PoolRecommendationResponse> {
    const url = `${
      ADALITE_CONFIG.ADALITE_BLOCKCHAIN_EXPLORER_URL
    }/api/account/poolRecommendation/poolHash/${poolHash}/stake/${stakeAmount}`
    return request(url).catch(() => ({
      recommendedPoolHash: ADALITE_CONFIG.ADALITE_STAKE_POOL_ID,
      isInRecommendedPoolSet: true,
      status: 'GivedPoolOk',
    }))
  }

  async function getStakingInfo(stakingKeyHashHex: HexString) {
    const url = `${
      ADALITE_CONFIG.ADALITE_BLOCKCHAIN_EXPLORER_URL
    }/api/account/info/${stakingKeyHashHex}`
    const response: StakingInfoResponse = await request(url)
    return response
  }

  function getValidStakepools(): Promise<ValidStakePoolsMapping> {
    const url = `${ADALITE_CONFIG.ADALITE_BLOCKCHAIN_EXPLORER_URL}/api/v2/stakePools`
    return request(url)
  }

  function getBestSlot(): Promise<BestSlotResponse> {
    return request(`${ADALITE_CONFIG.ADALITE_BLOCKCHAIN_EXPLORER_URL}/api/v2/bestSlot`)
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
    getStakingHistory,
    getRewardDetails,
    getPoolRecommendation,
    getStakingInfo,
    getBestSlot,
    getValidStakepools,
  }
}

export default blockchainExplorer
