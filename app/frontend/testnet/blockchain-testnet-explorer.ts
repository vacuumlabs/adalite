import request from './../wallet/helpers/request'
import {ADALITE_CONFIG} from './../config'
import  {buf2hex} from './libs/bech32'

const TestnetBlockchainExplorer = () => {

  async function submitRaw(dataRaw) {
    const hexData = buf2hex(dataRaw)
    const response = await request(
      `${ADALITE_CONFIG.ADALITE_SERVER_URL}/api/testnet/txs/submit`,
      'POST',
      JSON.stringify({
        hexData
      }),
      {
        'content-Type': 'application/json',
      },
    )
    console.log(response)
    return response
  }

  async function getAccountStatus(accountPubkeyHex) {
    const response = await request(
      `${ADALITE_CONFIG.ADALITE_SERVER_URL}/api/testnet/account/status`,
      'POST',
      JSON.stringify({
        accountPubkeyHex
      }),
      {
        'content-Type': 'application/json',
      },
    )
    return response.Right
  }

  async function getDelegationHistory() {
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
      {
        timeIssued: '06/14/2019, 11:01:24',
        entryType: 'reward',
        info: 'reward-information',
        amount: 3421,
      },
      {
        timeIssued: '06/14/2019, 11:01:23',
        entryType: 'delegation',
        stakePools: [
          {
            name: 'Stake Pool All In',
            id: 'stake-pool-all-in-id',
            percent: 100,
          },
        ],
      },
      {
        timeIssued: '06/16/2019, 11:01:26',
        entryType: 'delegation',
        stakePools: [
          {
            name: 'Stake Pool A',
            id: 'stake-pool-a-id',
            percent: 50,
          },
          {
            name: 'Stake Pool B',
            id: 'stake-pool-b-id',
            percent: 10,
          },
          {
            name: 'Stake Pool C',
            id: 'stake-pool-c-id',
            percent: 10,
          },
          {
            name: 'Stake Pool D',
            id: 'stake-pool-a-id',
            percent: 10,
          },
          {
            name: 'Stake Pool E',
            id: 'stake-pool-b-id',
            percent: 10,
          },
          {
            name: 'Stake Pool F',
            id: 'stake-pool-c-id',
            percent: 10,
          },
        ],
      },
    ]
  }

  async function getRunningStakePools() {
    const response = await fetch(
      `${ADALITE_CONFIG.ADALITE_SERVER_URL}/api/testnet/pools`, {
        method: 'POST',
        body: null,
        headers: {
          'content-Type': 'application/json',
        },
      }
      )
    console.log('ahoj')
    const poolArray = JSON.parse(await response.text()).Right
    return new Set(poolArray)
  }

  return {
    submitRaw,
    getAccountStatus,
    getDelegationHistory,
    getRunningStakePools,
  }

}

export {
  TestnetBlockchainExplorer,
}
