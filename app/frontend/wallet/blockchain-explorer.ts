import request from './helpers/request'
import range from './helpers/range'
import debugLog from '../helpers/debugLog'
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
  Address,
  TokenBundle,
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
import {aggregateTokenBundles, parseToken, getTokenBundlesDifference} from './helpers/tokenFormater'
import {StakepoolDataProvider} from '../helpers/dataProviders/types'
import {createStakepoolDataProvider} from '../helpers/dataProviders/stakepoolDataProvider'
import {InternalError, InternalErrorReason} from '../errors'
import {throwIfEpochBoundary} from '../helpers/epochBoundaryUtils'
import cacheResults from '../helpers/cacheResults'
import {filterValidTransactions} from '../helpers/common'
import * as assert from 'assert'

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

  const {fn: _getAddressInfos, invalidate: invalidateGetAddressInfosCache} = cacheResults(15000)(
    _fetchBulkAddressInfo
  )

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
        assert(elem != null)
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
    const validTransactions = filterValidTransactions(txHistoryEntries) // TODO temporary workaround
    // until collateral inputs in adalite-backend are exposed to properly show effect
    // of invalid transactions in UI/csv export
    return validTransactions.sort((a, b) => b.ctbTimeIssued - a.ctbTimeIssued)
  }

  function prepareTxHistoryEntry(tx: CaTxEntry, addresses: string[]): TxSummaryEntry {
    const outputTokenBundle: TokenBundle[] = []
    const inputTokenBundle: TokenBundle[] = []

    let effect = 0 //effect on wallet balance accumulated
    for (const [address, amount] of tx.ctbInputs || []) {
      if (addresses.includes(address)) {
        effect -= +amount.getCoin
        const parsedInputTokenBundle = amount.getTokens.map((token) => parseToken(token))
        inputTokenBundle.push(parsedInputTokenBundle)
      }
    }
    for (const [address, amount] of tx.ctbOutputs || []) {
      if (addresses.includes(address)) {
        effect += +amount.getCoin
        const parsedOutputTokenBundle = amount.getTokens.map((token) => parseToken(token))
        outputTokenBundle.push(parsedOutputTokenBundle)
      }
    }
    return {
      ...tx,
      fee: parseInt(tx.fee, 10) as Lovelace,
      effect: effect as Lovelace,
      tokenEffects: getTokenBundlesDifference(
        aggregateTokenBundles(outputTokenBundle),
        aggregateTokenBundles(inputTokenBundle)
      ),
    }
  }

  async function fetchTxInfo(txHash: string): Promise<TxSummary> {
    const url = `${ADALITE_CONFIG.ADALITE_BLOCKCHAIN_EXPLORER_URL}/api/txs/summary/${txHash}`
    const response: TxSummaryResponse = await request(url)
    // @ts-ignore (TODO, handle 'Left')
    return response.Right
  }

  async function isSomeAddressUsed(addresses: Array<string>): Promise<boolean> {
    const addressInfos = await _getAddressInfos(addresses)
    assert(addressInfos != null)
    return addressInfos.caTxNum > 0
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
    const addressInfos = await Promise.all(
      chunks.map(async (index) => {
        const beginIndex = index * gapLimit
        return await _getAddressInfos(addresses.slice(beginIndex, beginIndex + gapLimit))
      })
    )
    const addressTokenBundles = addressInfos.map((addressSummary) => {
      assert(addressSummary != null)
      return addressSummary.caBalance.getTokens.map((token) => parseToken(token))
    })
    const tokenBundle = aggregateTokenBundles(addressTokenBundles).filter(
      (token) => token.quantity > 0
    )
    const coins = addressInfos.reduce((acc, elem) => {
      assert(elem != null)
      return acc + parseInt(elem.caBalance.getCoin, 10)
    }, 0) as Lovelace
    return {
      coins,
      tokenBundle,
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
      if (!response.statusCode) {
        throwIfEpochBoundary()
        throw new InternalError(InternalErrorReason.ServerError)
      }

      if (response.statusCode === 400) {
        throw new InternalError(InternalErrorReason.TransactionRejectedByNetwork, {
          message: response.Left,
        })
      } else if (response.statusCode === 425) {
        // error 425 can be returned by blockfrost API (used by adalite-backend)
        // https://docs.blockfrost.io/#tag/Cardano-Transactions/paths/~1tx~1submit/post
        throw new InternalError(InternalErrorReason.TransactionRejectedMempoolFull, {
          message: response.Left,
        })
      } else if (response.statusCode === 504) {
        // Usually happens when a gateway timeout is received from the adalite-backend
        // where a gateway-timeout is sent from the load balancer after the backend not
        // responding for too long (~20 seconds).
        // The backend itself may still be trying to submit the transaction though
        // with eventual success.
        //
        // context: https://github.com/input-output-hk/cardano-wallet/issues/2963
        throw new InternalError(InternalErrorReason.TransactionSubmissionTimedOut)
      } else {
        throwIfEpochBoundary()
        throw new InternalError(InternalErrorReason.ServerError)
      }
    }

    return response.Right
  }

  async function fetchUnspentTxOutputs(addresses: Array<string>): Promise<UTxO[]> {
    // utxos can be fetched by chunks of 50 (backend limit) instead of discovery gap limit, because
    // differently from the rest of calls, these are not involved in address discovery
    // so they don't have to align with the gap limit in order to always request the same
    // addresses to hit the cache (the caching key is the stringified list of addresses requested)
    const chunkSize = 50
    const chunks = range(0, Math.ceil(addresses.length / chunkSize))

    const url = `${ADALITE_CONFIG.ADALITE_BLOCKCHAIN_EXPLORER_URL}/api/bulk/addresses/utxo`
    const response = (
      await Promise.all(
        chunks.map(async (index) => {
          const beginIndex = index * chunkSize
          const response: BulkAdressesUtxoResponse = await request(
            url,
            'POST',
            JSON.stringify(addresses.slice(beginIndex, beginIndex + chunkSize)),
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
      const tokenBundle: TokenBundle = elem.cuCoins.getTokens.map((token) => ({
        ...token,
        quantity: parseInt(token.quantity, 10),
      }))
      return {
        txHash: elem.cuId,
        address: elem.cuAddress as Address,
        coins: parseInt(elem.cuCoins.getCoin, 10) as Lovelace,
        tokenBundle,
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

    const poolHashToPoolName = (poolHash: string) => {
      const poolUrl = extractUrl(poolHash)
      if (!poolUrl) {
        return UNKNOWN_POOL_NAME
      }
      return metaUrlToPoolNameMap[poolUrl] || UNKNOWN_POOL_NAME
    }

    const parseStakePool = (stakingHistoryObject: any): StakingHistoryStakePool => ({
      id: stakingHistoryObject.poolHash,
      name: stakingHistoryObject.name || poolHashToPoolName(stakingHistoryObject.poolHash),
    })

    // Prepare delegations
    let oldPool: StakingHistoryStakePool | null = null
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

    // Prepare staking key registration/deregistration
    const parsedStakingKeyRegistrations = stakingKeyRegistrations.map((registration) => {
      const stakingKeyRegistration: StakingKeyRegistration = {
        type:
          registration.action === 'registration'
            ? StakingHistoryItemType.STAKING_KEY_REGISTRATION
            : StakingHistoryItemType.STAKING_KEY_DEREGISTRATION,
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
    const getPool = async (poolHash: string): Promise<StakePoolInfo | HostedPoolMetadata> => {
      const stakePool = validStakepoolDataProvider.getPoolInfoByPoolHash(poolHash)
      if (stakePool?.name) {
        return stakePool
      }
      const poolInfo = stakePool ? await getPoolInfo(stakePool.url) : null
      return poolInfo && 'name' in poolInfo
        ? poolInfo
        : ({name: UNKNOWN_POOL_NAME} as HostedPoolMetadata)
    }

    const nextRewardDetailsWithMetaData: Array<RewardWithMetadata> = await Promise.all(
      nextRewardDetails.map(async (nextRewardDetail: NextRewardDetail) => {
        const poolHash = nextRewardDetail.poolHash
        if (poolHash) {
          return {
            ...nextRewardDetail,
            distributionEpoch: nextRewardDetail.forEpoch + epochsToRewardDistribution,
            pool: await getPool(nextRewardDetail.poolHash),
          }
        } else {
          return {
            ...nextRewardDetail,
            pool: {},
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
      isInPrivatePoolSet: false,
      isRecommendationPrivate: false,
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

  function invalidateCache() {
    invalidateGetAddressInfosCache()
  }

  return {
    getTxHistory,
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
    invalidateCache,
  }
}

export default blockchainExplorer
