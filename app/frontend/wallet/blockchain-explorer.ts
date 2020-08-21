import request from './helpers/request'
import range from './helpers/range'
import NamedError from '../helpers/NamedError'
import debugLog from '../helpers/debugLog'
import getHash from '../helpers/getHash'

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

  async function getDelegationHistory(accountPubkeyHex) {
    // Urls
    // const delegationsUrl = `https://explorer-staging.adalite.io/api/account/delegationHistory/e1d33cabe9bc7a7646243c03f062881d06744b3d53983823178973b9b0`
    const delegationsUrl = `https://explorer-staging.adalite.io/api/account/delegationHistory/${accountPubkeyHex}`
    // const delegationsUrl = `${ADALITE_CONFIG.ADALITE_BLOCKCHAIN_EXPLORER_URL}/???`
    // const rewardsUrl = `https://explorer-staging.adalite.io/api/account/rewardHistory/${accountPubkeyHex}`
    // const withdrawalsUrl = `https://explorer-staging.adalite.io/api/account/withdrawalHistory/e1d33cabe9bc7a7646243c03f062881d06744b3d53983823178973b9b0`
    const withdrawalsUrl = `https://explorer-staging.adalite.io/api/account/withdrawalHistory/${accountPubkeyHex}`
    // const withdrawalsUrl = `${ADALITE_CONFIG.ADALITE_BLOCKCHAIN_EXPLORER_URL}/???`

    // Run requests in parallel
    const delegationsRequest = request(delegationsUrl)
    // const rewardsRequest = request(rewardsUrl)
    const withdrawalsRequest = request(withdrawalsUrl)

    // Await all
    const delegations = await delegationsRequest
    // const rewards = await rewardsRequest
    const withdrawals = await withdrawalsRequest

    // const delegations = [{"epochNo":208,"time":"2020-07-31T03:38:31.000Z","poolHash":"3b0a33f53dfde8ffd7f05e16aeb9b888a019b383c43cbad26c517985","poolName":"Placeholder","type":"Stake delegation"},{"epochNo":208,"time":"2020-07-31T03:36:51.000Z","poolHash":"64e09628015d1065e4a11f032c90f677ba1f2f583ff0f55a158450b0","poolName":"Placeholder","type":"Stake delegation"},{"epochNo":208,"time":"2020-07-31T02:58:51.000Z","poolHash":"aa3d1049e013e84d811e684b63378790fdce0b7a16a71938c1602164","poolName":"Placeholder","type":"Stake delegation"},{"epochNo":208,"time":"2020-07-31T02:49:31.000Z","poolHash":"ea595c6f726db925b6832af51795fd8a46e700874c735d204f7c5841","poolName":"Placeholder","type":"Stake delegation"},{"epochNo":208,"time":"2020-07-30T18:19:11.000Z","poolHash":"e00ff546b17eb7ed726411edc74eccdad9d176d0d338c21a3d8daf34","poolName":"Placeholder","type":"Stake delegation"},{"epochNo":208,"time":"2020-07-30T17:42:31.000Z","poolHash":"3dc5218de6bf5a29ad6203d9da31b7128c414872e53b8f09767764d4","poolName":"Placeholder","type":"Stake delegation"},{"epochNo":208,"time":"2020-07-30T11:53:31.000Z","poolHash":"00004614332ac81201d8302d4cb8262502af229256e143dc2156156e","poolName":"Placeholder","type":"Stake delegation"},{"epochNo":208,"time":"2020-07-30T06:54:51.000Z","poolHash":"618ab17ec8ea7239b4ac0c826b667c599489e25524ce74841a29d510","poolName":"Placeholder","type":"Stake delegation"},{"epochNo":208,"time":"2020-07-30T06:51:51.000Z","poolHash":"00004614332ac81201d8302d4cb8262502af229256e143dc2156156e","poolName":"Placeholder","type":"Stake delegation"},{"epochNo":208,"time":"2020-07-30T06:16:31.000Z","poolHash":"6198d2070b6e70cc2a5e370a43dd49699960c88a084ffe390abe9a6a","poolName":"Placeholder","type":"Stake delegation"},{"epochNo":208,"time":"2020-07-30T05:36:51.000Z","poolHash":"398964318c3664acd3a17d6d0f29a74b6d9a8200cde2f875629906b9","poolName":"Placeholder","type":"Stake delegation"},{"epochNo":208,"time":"2020-07-30T04:16:51.000Z","poolHash":"3dc5218de6bf5a29ad6203d9da31b7128c414872e53b8f09767764d4","poolName":"Placeholder","type":"Stake delegation"},{"epochNo":208,"time":"2020-07-30T04:08:51.000Z","poolHash":"b59366e330a6db8260ad9aae8446ba8c908931d1b9cb3cca5d1d84aa","poolName":"Placeholder","type":"Stake delegation"},{"epochNo":208,"time":"2020-07-30T03:59:51.000Z","poolHash":"3dc5218de6bf5a29ad6203d9da31b7128c414872e53b8f09767764d4","poolName":"Placeholder","type":"Stake delegation"},{"epochNo":208,"time":"2020-07-30T03:19:31.000Z","poolHash":"bbfb301cad22e7a62f6fea6e3c93aec4e6f714aef66b0a828e792f12","poolName":"Placeholder","type":"Stake delegation"},{"epochNo":208,"time":"2020-07-30T01:42:51.000Z","poolHash":"0001a003afb844ce6d9409fc49e049db654a78dc77f1151cb6cd548f","poolName":"Placeholder","type":"Stake delegation"},{"epochNo":208,"time":"2020-07-30T01:34:11.000Z","poolHash":"fcbfb4a3c18f890de7a51f68603b18e654f8b432abdda17c53a0d586","poolName":"Placeholder","type":"Stake delegation"},{"epochNo":208,"time":"2020-07-30T01:31:51.000Z","poolHash":"618ab17ec8ea7239b4ac0c826b667c599489e25524ce74841a29d510","poolName":"Placeholder","type":"Stake delegation"},{"epochNo":208,"time":"2020-07-30T01:17:51.000Z","poolHash":"0001a003afb844ce6d9409fc49e049db654a78dc77f1151cb6cd548f","poolName":"Placeholder","type":"Stake delegation"},{"epochNo":208,"time":"2020-07-30T01:05:11.000Z","poolHash":"8bd3e5cffcd9b34270500003723df8efce4e22f436b4244c55388042","poolName":"Placeholder","type":"Stake delegation"},{"epochNo":208,"time":"2020-07-30T00:56:51.000Z","poolHash":"0001a00910e9e6ae309e0f216aa6669b9a711bc627c98cb66e8f11b0","poolName":"Placeholder","type":"Stake delegation"},{"epochNo":208,"time":"2020-07-30T00:55:11.000Z","poolHash":"90f35b86d1bb85f15f559a612b5f3a406af7ea04530f65807950177f","poolName":"Placeholder","type":"Stake delegation"},{"epochNo":208,"time":"2020-07-30T00:12:11.000Z","poolHash":"74a10b8241fc67a17e189a58421506b7edd629ac490234933afbed97","poolName":"Placeholder3","type":"Stake delegation"},{"epochNo":208,"time":"2020-07-29T23:47:11.000Z","poolHash":"c1ede3cc9133209466774d4826044e408db13d6fe6df751a73500f16","poolName":"Placeholder2","type":"Stake delegation"},{"epochNo":208,"time":"2020-07-29T23:30:51.000Z","poolHash":"01df29429173d263c7533a22742dae19f16a08798b7a57873c34cf58","poolName":"Placeholder1","type":"Stake delegation"}]
    // const delegations = [{"epochNo":208,"time":"2020-07-31T03:38:31.000Z","pool":{"poolHash":"3b0a33f53dfde8ffd7f05e16aeb9b888a019b383c43cbad26c517985","metaUrl":"https://stakepool.at/atada.metadata2.json"},"poolName":"Placeholder","type":"Stake delegation"},{"epochNo":208,"time":"2020-07-31T03:36:51.000Z","pool":{"poolHash":"64e09628015d1065e4a11f032c90f677ba1f2f583ff0f55a158450b0","metaUrl":"https://stakepool.at/atada.metadata2.json"},"poolName":"Placeholder","type":"Stake delegation"},{"epochNo":208,"time":"2020-07-31T02:58:51.000Z","pool":{"poolHash":"aa3d1049e013e84d811e684b63378790fdce0b7a16a71938c1602164","metaUrl":"https://stakepool.at/atada.metadata2.json"},"poolName":"Placeholder","type":"Stake delegation"},{"epochNo":208,"time":"2020-07-31T02:49:31.000Z","pool":{"poolHash":"ea595c6f726db925b6832af51795fd8a46e700874c735d204f7c5841","metaUrl":"https://stakepool.at/atada.metadata2.json"},"poolName":"Placeholder","type":"Stake delegation"},{"epochNo":208,"time":"2020-07-30T18:19:11.000Z","pool":{"poolHash":"e00ff546b17eb7ed726411edc74eccdad9d176d0d338c21a3d8daf34","metaUrl":"https://stakepool.at/atada.metadata2.json"},"poolName":"Placeholder","type":"Stake delegation"},{"epochNo":208,"time":"2020-07-30T17:42:31.000Z","pool":{"poolHash":"3dc5218de6bf5a29ad6203d9da31b7128c414872e53b8f09767764d4","metaUrl":"https://stakepool.at/atada.metadata2.json"},"poolName":"Placeholder","type":"Stake delegation"},{"epochNo":208,"time":"2020-07-30T11:53:31.000Z","pool":{"poolHash":"00004614332ac81201d8302d4cb8262502af229256e143dc2156156e","metaUrl":"https://stakepool.at/atada.metadata2.json"},"poolName":"Placeholder","type":"Stake delegation"},{"epochNo":208,"time":"2020-07-30T06:54:51.000Z","pool":{"poolHash":"618ab17ec8ea7239b4ac0c826b667c599489e25524ce74841a29d510","metaUrl":"https://stakepool.at/atada.metadata2.json"},"poolName":"Placeholder","type":"Stake delegation"},{"epochNo":208,"time":"2020-07-30T06:51:51.000Z","pool":{"poolHash":"00004614332ac81201d8302d4cb8262502af229256e143dc2156156e","metaUrl":"https://stakepool.at/atada.metadata2.json"},"poolName":"Placeholder","type":"Stake delegation"},{"epochNo":208,"time":"2020-07-30T06:16:31.000Z","pool":{"poolHash":"6198d2070b6e70cc2a5e370a43dd49699960c88a084ffe390abe9a6a","metaUrl":"https://stakepool.at/atada.metadata2.json"},"poolName":"Placeholder","type":"Stake delegation"},{"epochNo":208,"time":"2020-07-30T05:36:51.000Z","pool":{"poolHash":"398964318c3664acd3a17d6d0f29a74b6d9a8200cde2f875629906b9","metaUrl":"https://stakepool.at/atada.metadata2.json"},"poolName":"Placeholder","type":"Stake delegation"},{"epochNo":208,"time":"2020-07-30T04:16:51.000Z","pool":{"poolHash":"3dc5218de6bf5a29ad6203d9da31b7128c414872e53b8f09767764d4","metaUrl":"https://stakepool.at/atada.metadata2.json"},"poolName":"Placeholder","type":"Stake delegation"},{"epochNo":208,"time":"2020-07-30T04:08:51.000Z","pool":{"poolHash":"b59366e330a6db8260ad9aae8446ba8c908931d1b9cb3cca5d1d84aa","metaUrl":"https://stakepool.at/atada.metadata2.json"},"poolName":"Placeholder","type":"Stake delegation"},{"epochNo":208,"time":"2020-07-30T03:59:51.000Z","pool":{"poolHash":"3dc5218de6bf5a29ad6203d9da31b7128c414872e53b8f09767764d4","metaUrl":"https://stakepool.at/atada.metadata2.json"},"poolName":"Placeholder","type":"Stake delegation"},{"epochNo":208,"time":"2020-07-30T03:19:31.000Z","pool":{"poolHash":"bbfb301cad22e7a62f6fea6e3c93aec4e6f714aef66b0a828e792f12","metaUrl":"https://stakepool.at/atada.metadata2.json"},"poolName":"Placeholder","type":"Stake delegation"},{"epochNo":208,"time":"2020-07-30T01:42:51.000Z","pool":{"poolHash":"0001a003afb844ce6d9409fc49e049db654a78dc77f1151cb6cd548f","metaUrl":"https://stakepool.at/atada.metadata2.json"},"poolName":"Placeholder","type":"Stake delegation"},{"epochNo":208,"time":"2020-07-30T01:34:11.000Z","pool":{"poolHash":"fcbfb4a3c18f890de7a51f68603b18e654f8b432abdda17c53a0d586","metaUrl":"https://stakepool.at/atada.metadata2.json"},"poolName":"Placeholder","type":"Stake delegation"},{"epochNo":208,"time":"2020-07-30T01:31:51.000Z","pool":{"poolHash":"618ab17ec8ea7239b4ac0c826b667c599489e25524ce74841a29d510","metaUrl":"https://stakepool.at/atada.metadata2.json"},"poolName":"Placeholder","type":"Stake delegation"},{"epochNo":208,"time":"2020-07-30T01:17:51.000Z","pool":{"poolHash":"0001a003afb844ce6d9409fc49e049db654a78dc77f1151cb6cd548f","metaUrl":"https://stakepool.at/atada.metadata2.json"},"poolName":"Placeholder","type":"Stake delegation"},{"epochNo":208,"time":"2020-07-30T01:05:11.000Z","pool":{"poolHash":"8bd3e5cffcd9b34270500003723df8efce4e22f436b4244c55388042","metaUrl":"https://stakepool.at/atada.metadata2.json"},"poolName":"Placeholder","type":"Stake delegation"},{"epochNo":208,"time":"2020-07-30T00:56:51.000Z","pool":{"poolHash":"0001a00910e9e6ae309e0f216aa6669b9a711bc627c98cb66e8f11b0","metaUrl":"https://stakepool.at/atada.metadata2.json"},"poolName":"Placeholder","type":"Stake delegation"},{"epochNo":208,"time":"2020-07-30T00:55:11.000Z","pool":{"poolHash":"90f35b86d1bb85f15f559a612b5f3a406af7ea04530f65807950177f","metaUrl":"https://stakepool.at/atada.metadata2.json"},"poolName":"Placeholder","type":"Stake delegation"},{"epochNo":208,"time":"2020-07-30T00:12:11.000Z","pool":{"poolHash":"74a10b8241fc67a17e189a58421506b7edd629ac490234933afbed97","metaUrl":"https://stakepool.at/atada.metadata2.json"},"poolName":"Placeholder","type":"Stake delegation"},{"epochNo":208,"time":"2020-07-29T23:47:11.000Z","pool":{"poolHash":"c1ede3cc9133209466774d4826044e408db13d6fe6df751a73500f16","metaUrl":"https://stakepool.at/atada.metadata2.json"},"poolName":"Placeholder","type":"Stake delegation"},{"epochNo":208,"time":"2020-07-29T23:30:51.000Z","pool":{"poolHash":"01df29429173d263c7533a22742dae19f16a08798b7a57873c34cf58","metaUrl":"https://stakepool.at/atada.metadata2.json"},"poolName":"Placeholder","type":"Stake delegation"}]
    const rewards = [] // PLACEHOLDER
    // const withdrawals = [] // PLACEHOLDER

    return {delegations, rewards, withdrawals}
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
    getDelegationHistory,
  }
}

export default blockchainExplorer
