import request from './../wallet/helpers/request'
import {ADALITE_CONFIG} from './../config'
// import  {buf2hex} from './libs/bech32'
import blockchainExplorer from '../wallet/blockchain-explorer'

const tangataManuPKprefix = '85'

const TestnetBlockchainExplorer = () => {
  async function submitRaw(dataRaw) {
    // const hexData = buf2hex(dataRaw)
    const hexData = null
    const response = await request(
      `${ADALITE_CONFIG.ADALITE_SERVER_URL}/api/testnet/txs/signed`,
      'POST',
      JSON.stringify({
        hexData,
      }),
      {
        'content-Type': 'application/json',
      }
    )
    // console.log(response)
    return response
  }

  async function getAccountStatus(accountPubkeyHex) {
    const response = await request(
      `${ADALITE_CONFIG.ADALITE_SERVER_URL}/api/testnet/account/info`,
      'POST',
      JSON.stringify({
        accountPubkeyHex,
      }),
      {
        'content-Type': 'application/json',
      }
    )
    return response.Right
  }

  async function getDelegationHistory(accountPubkeyHex, limit) {
    const extendedPubKey = tangataManuPKprefix + accountPubkeyHex
    const response = await request(
      `${ADALITE_CONFIG.ADALITE_SERVER_URL}/api/testnet/account/delegationHistory`,
      'POST',
      JSON.stringify({
        extendedPubKey,
        limit,
      }),
      {
        'content-Type': 'application/json',
      }
    )
    return [
      {
        timeIssued: '06/12/2019, 11:01:22',
        entryType: 'delegation',
        stakePools: [
          {
            name: 'Stake Pool Uno',
            id: 'stake-pool-numero-uno-id',
            percent: 33,
          },
          {
            name: 'Stake Pool Dos',
            id: 'stake-pool-numero-dos-id',
            percent: 33,
          },
          {
            name: 'Stake Pool Tres',
            id: 'stake-pool-numero-tres-id',
            percent: 34,
          },
        ],
      },
    ]
    return response.Right
  }

  async function getRunningStakePools() {
    const response = await fetch(`${ADALITE_CONFIG.ADALITE_SERVER_URL}/api/testnet/pools`, {
      method: 'POST',
      body: null,
      headers: {
        'content-Type': 'application/json',
      },
    })
    const poolArray = JSON.parse(await response.text()).Right
    const poolDict = poolArray.reduce((dict, el) => ((dict[el.pool_id] = {...el}), dict), {})
    return poolDict
  }

  return {
    submitRaw,
    getAccountStatus,
    getDelegationHistory,
    getRunningStakePools,
  }
}

export {TestnetBlockchainExplorer}
