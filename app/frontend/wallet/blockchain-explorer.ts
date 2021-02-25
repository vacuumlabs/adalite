import request from './helpers/request'
import range from './helpers/range'
import NamedError from '../helpers/NamedError'
import debugLog from '../helpers/debugLog'
import getHash from '../helpers/getHash'
import {
  StakingHistoryItemType,
  RewardWithdrawal,
  StakeDelegation,
  StakingHistoryStakePool,
  StakingReward,
  StakingKeyRegistration,
  HexString,
  Lovelace,
  TxSummaryEntry,
  StakingHistoryObject,
  HostedPoolMetadata,
  NextRewardDetailsFormatted,
  RewardWithMetadata,
  Balance,
  Token,
  _Address,
} from '../types'
import distinct from '../helpers/distinct'
import {UNKNOWN_POOL_NAME} from './constants'
import {captureMessage} from '@sentry/browser'
import {
  BulkAddressesSummaryResponse,
  TxSummaryResponse,
  SubmitResponse,
  BulkAdressesUtxoResponse,
  DelegationHistoryEntry,
  RewardsHistoryEntry,
  WithdrawalsHistoryEntry,
  StakeRegistrationHistoryEntry,
  NextRewardDetail,
  PoolRecommendationResponse,
  StakingInfoResponse,
  BestSlotResponse,
  BulkAddressesSummary,
  CaTxEntry,
  TxSummary,
  TxSubmission,
  StakePoolInfo,
  _Utxo,
  StakePoolInfosByPoolHash,
} from './backend-types'
import {UTxO} from './types'
import {aggregateTokens, formatToken} from './helpers/tokenFormater'
import {StakepoolDataProvider} from '../helpers/dataProviders/types'
import {createStakepoolDataProvider} from '../helpers/dataProviders/stakepoolDataProvider'

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

  async function _fetchBulkAddressInfo(
    addresses: Array<string>
  ): Promise<BulkAddressesSummary | undefined> {
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
    // TODO, handle 'Left'
    return 'Right' in result ? result.Right : undefined
  }

  const _getAddressInfos = cacheResults(5000)(_fetchBulkAddressInfo)

  async function getTxHistory(addresses: Array<string>): Promise<TxSummaryEntry[]> {
    const chunks = range(0, Math.ceil(addresses.length / gapLimit))
    const cachedAddressInfos: {caTxList: CaTxEntry[]} = (
      await Promise.all(
        chunks.map(async (index) => {
          const beginIndex = index * gapLimit
          return await _getAddressInfos(addresses.slice(beginIndex, beginIndex + gapLimit))
        })
      )
    ).reduce(
      (acc, elem) => {
        return {
          caTxList: [...acc.caTxList, ...elem.caTxList],
        }
      },
      {caTxList: []}
    )

    const filteredTxs: {[ctbId: string]: CaTxEntry} = {}
    cachedAddressInfos.caTxList.forEach((tx) => {
      filteredTxs[tx.ctbId] = tx
    })

    const txHistoryEntries = Object.values(filteredTxs).map((tx) => {
      if (!tx.ctbId) captureMessage(`Tx without hash: ${JSON.stringify(tx)}`)
      return prepareTxHistoryEntry(tx, addresses)
    })

    return txHistoryEntries.sort((a, b) => b.ctbTimeIssued - a.ctbTimeIssued)
  }

  function prepareTxHistoryEntry(tx: CaTxEntry, addresses: string[]): TxSummaryEntry {
    const outputTokens: Token[][] = []
    const inputTokens: Token[][] = []

    let effect = 0 //effect on wallet balance accumulated
    for (const [address, amount] of tx.ctbInputs || []) {
      if (addresses.includes(address)) {
        effect -= +amount.getCoin
        const formatedInputTokens = amount.getTokens.map((token) => formatToken(token, -1))
        inputTokens.push(formatedInputTokens)
      }
    }
    for (const [address, amount] of tx.ctbOutputs || []) {
      if (addresses.includes(address)) {
        effect += +amount.getCoin
        const formatedOutputTokens = amount.getTokens.map((token) => formatToken(token, 1))
        outputTokens.push(formatedOutputTokens)
      }
    }
    return {
      ...tx,
      fee: parseInt(tx.fee, 10) as Lovelace,
      effect: effect as Lovelace,
      tokenEffects: aggregateTokens([...inputTokens, ...outputTokens]).filter(
        (token) => token.quantity !== 0
      ),
    }
  }

  async function fetchTxInfo(txHash: string): Promise<TxSummary> {
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
  async function filterUsedAddresses(addresses: Array<string>): Promise<Set<string>> {
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

  async function getBalance(addresses: Array<string>): Promise<Balance> {
    const chunks = range(0, Math.ceil(addresses.length / gapLimit))
    const txHistory = await Promise.all(
      chunks.map(async (index) => {
        const beginIndex = index * gapLimit
        return await _getAddressInfos(addresses.slice(beginIndex, beginIndex + gapLimit))
      })
    )
    const addressTokens = txHistory.map((txHistoryEntry) => {
      const formatedTokens = txHistoryEntry.caBalance.getTokens.map((token) =>
        formatToken(token, 1)
      )
      return formatedTokens
    })
    const tokens = aggregateTokens(addressTokens).filter((token) => token.quantity > 0)
    const coins = txHistory.reduce(
      (acc, elem) => acc + parseInt(elem.caBalance.getCoin, 10),
      0
    ) as Lovelace
    return {
      coins,
      tokens,
    }
  }

  async function submitTxRaw(txHash, txBody, params): Promise<TxSubmission> {
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

  async function fetchUnspentTxOutputs(addresses: Array<string>): Promise<UTxO[]> {
    const chunks = range(0, Math.ceil(addresses.length / gapLimit))

    const url = `${ADALITE_CONFIG.ADALITE_BLOCKCHAIN_EXPLORER_URL}/api/bulk/addresses/utxo`
    const response = (
      await Promise.all(
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
          return response.Right as Array<_Utxo>
        })
      )
    ).reduce((acc, cur) => acc.concat(cur), [])

    return response.map((elem) => {
      const tokens: Token[] = elem.cuCoins.getTokens.map((token) => ({
        ...token,
        quantity: parseInt(token.quantity, 10),
      }))
      return {
        txHash: elem.cuId,
        address: elem.cuAddress as _Address,
        coins: parseInt(elem.cuCoins.getCoin, 10) as Lovelace,
        tokens,
        outputIndex: elem.cuOutIndex,
      }
    })
  }

  async function getPoolInfo(url: string): Promise<HostedPoolMetadata> {
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

  async function getStakingHistory(
    stakingKeyHashHex: HexString,
    validStakepoolDataProvider: StakepoolDataProvider
  ): Promise<StakingHistoryObject[]> {
    const delegationsUrl = `${ADALITE_CONFIG.ADALITE_BLOCKCHAIN_EXPLORER_URL}/api/account/delegationHistory/${stakingKeyHashHex}`
    const rewardsUrl = `${ADALITE_CONFIG.ADALITE_BLOCKCHAIN_EXPLORER_URL}/api/account/rewardHistory/${stakingKeyHashHex}`
    const withdrawalsUrl = `${ADALITE_CONFIG.ADALITE_BLOCKCHAIN_EXPLORER_URL}/api/account/withdrawalHistory/${stakingKeyHashHex}`
    const stakingKeyRegistrationUrl = `${ADALITE_CONFIG.ADALITE_BLOCKCHAIN_EXPLORER_URL}/api/account/stakeRegistrationHistory/${stakingKeyHashHex}`

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
      validStakepoolDataProvider.getPoolInfoByPoolHash(poolHash)?.url || null

    const poolMetaUrls = distinct(
      [...delegations, ...rewards]
        .filter(({name}) => !name)
        .map(({poolHash}) => extractUrl(poolHash))
    ).filter((url) => url != null)

    const metaUrlToPoolNameMap = (
      await Promise.all(
        poolMetaUrls.map((url: string) =>
          getPoolInfo(url).then((metaData) => ({url, name: metaData.name}))
        )
      )
    ).reduce((map, {url, name}) => {
      map[url] = name
      return map
    }, {})

    const poolHashToPoolName = (poolHash) =>
      metaUrlToPoolNameMap[extractUrl(poolHash)] || UNKNOWN_POOL_NAME

    const parseStakePool = (stakingHistoryObject: any): StakingHistoryStakePool => ({
      id: stakingHistoryObject.poolHash,
      name: stakingHistoryObject.name || poolHashToPoolName(stakingHistoryObject.poolHash),
    })

    // Prepare delegations
    let oldPool: StakingHistoryStakePool = null
    const parsedDelegations = delegations
      .map((delegation) => ({...delegation, time: new Date(delegation.time)}))
      .sort((a, b) => a.time.getTime() - b.time.getTime()) // sort by time, oldest first
      .map((delegation) => {
        const stakePool: StakingHistoryStakePool = parseStakePool(delegation)
        const stakeDelegation: StakeDelegation = {
          type: StakingHistoryItemType.STAKE_DELEGATION,
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
        type: StakingHistoryItemType.STAKING_REWARD,
        epoch: reward.epochNo,
        dateTime: new Date(reward.time),
        forEpoch: reward.forDelegationInEpoch,
        reward: parseInt(reward.amount, 10) as Lovelace,
        stakePool: parseStakePool(reward),
        rewardType: reward.rewardType,
      }

      return stakingReward
    })

    // Prepare withdrawals
    const parsedWithdrawals = withdrawals.map((withdrawal) => {
      const rewardWithdrawal: RewardWithdrawal = {
        type: StakingHistoryItemType.REWARD_WITHDRAWAL,
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
        type: StakingHistoryItemType.STAKING_KEY_REGISTRATION,
        txHash: registration.txHash,
        epoch: registration.epochNo,
        dateTime: new Date(registration.time),
        action: registration.action,
        stakingKey: stakingKeyHashHex,
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
    validStakepoolDataProvider: StakepoolDataProvider,
    epochsToRewardDistribution: number
  ): Promise<NextRewardDetailsFormatted> {
    const getPool = async (
      poolHash: string
    ): Promise<StakePoolInfo | HostedPoolMetadata | string> => {
      const stakePool = validStakepoolDataProvider.getPoolInfoByPoolHash(poolHash)
      if (stakePool) {
        if (stakePool.name) {
          return stakePool
        } else if (stakePool.url) {
          return await getPoolInfo(stakePool.url).catch(() => UNKNOWN_POOL_NAME)
        }
      }

      return UNKNOWN_POOL_NAME
    }

    const nextRewardDetailsWithMetaData: Array<RewardWithMetadata> = await Promise.all(
      nextRewardDetails.map(async (nextRewardDetail: NextRewardDetail) => {
        const poolHash = nextRewardDetail.poolHash
        if (poolHash) {
          return {
            ...nextRewardDetail,
            distributionEpoch: nextRewardDetail.forEpoch + epochsToRewardDistribution,
            pool: await getPool(poolHash),
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
    const url = `${ADALITE_CONFIG.ADALITE_BLOCKCHAIN_EXPLORER_URL}/api/account/poolRecommendation/poolHash/${poolHash}/stake/${stakeAmount}`
    return request(url).catch(() => ({
      recommendedPoolHash: ADALITE_CONFIG.ADALITE_STAKE_POOL_ID,
      isInRecommendedPoolSet: true,
      status: 'GivedPoolOk',
    }))
  }

  async function getStakingInfo(stakingKeyHashHex: HexString): Promise<StakingInfoResponse> {
    const url = `${ADALITE_CONFIG.ADALITE_BLOCKCHAIN_EXPLORER_URL}/api/account/info/${stakingKeyHashHex}`
    const response = await request(url)
    // if we fail to recieve poolMeta from backend
    // TODO: IMHO we shouldn't freestyle append poolInfo here, it breaks types easily
    if (response.delegation.url && !response.delegation.name) {
      const poolInfo = await getPoolInfo(response.delegation.url)
      return {
        ...response,
        delegation: {
          ...response.delegation,
          ...poolInfo,
        },
      }
    }
    return response
  }

  async function getStakepoolDataProvider(): Promise<StakepoolDataProvider> {
    const url = `${ADALITE_CONFIG.ADALITE_BLOCKCHAIN_EXPLORER_URL}/api/v2/stakePools`
    const validStakepools: StakePoolInfosByPoolHash = await request(url)
    return createStakepoolDataProvider(validStakepools)
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
    getStakepoolDataProvider,
  }
}

export default blockchainExplorer
