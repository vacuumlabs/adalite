import fetchMock from 'fetch-mock'
import singleAddressesMock from './singleAddressesMock'
import utxoMock from './utxoMock'

const mock = (ADALITE_CONFIG) => {
  function clean() {
    fetchMock.restore()
  }

  function mockBulkAddressSummaryEndpoint() {
    fetchMock.config.overwriteRoutes = true

    fetchMock.post({
      name: `${ADALITE_CONFIG.ADALITE_BLOCKCHAIN_EXPLORER_URL}/api/bulk/addresses/summary`,
      matcher: `${ADALITE_CONFIG.ADALITE_BLOCKCHAIN_EXPLORER_URL}/api/bulk/addresses/summary`,
      response: (url, options) => {
        const summary = {
          caAddresses: [],
          caTxNum: 0,
          caBalance: {getCoin: 0, getTokens: []},
          caTxList: [],
        }
        JSON.parse(options.body).forEach((address) => {
          const singleResponse = singleAddressesMock[address]
          summary.caAddresses.push(address)

          if (singleResponse) {
            //eslint-disable-next-line max-len
            summary.caBalance.getCoin = (
              parseInt(summary.caBalance.getCoin, 10) +
              parseInt(singleResponse.Right.caBalance.getCoin, 10)
            ).toString()
            summary.caTxNum = summary.caTxNum + singleResponse.Right.caTxNum
            summary.caTxList = [...summary.caTxList, ...singleResponse.Right.caTxList]
          }
        })

        return {
          status: 200,
          body: {Right: summary},
          sendAsJson: true,
        }
      },
    })
  }

  function mockGetAccountInfo() {
    fetchMock.config.overwriteRoutes = true
    const acctInfoMock = {
      delegation: {},
      rewards: 50000000,
      hasStakingKey: false,
      nextRewardDetails: [{forEpoch: 212}, {forEpoch: 213}, {forEpoch: 214}, {forEpoch: 215}],
    }

    fetchMock.mock({
      matcher: `begin:${ADALITE_CONFIG.ADALITE_BLOCKCHAIN_EXPLORER_URL}/api/account/info/`,
      response: {
        status: 200,
        body: acctInfoMock,
        sendAsJson: true,
      },
    })
  }

  function mockGetStakePools() {
    fetchMock.config.overwriteRoutes = true

    const stakePoolsMock = {
      '04c60c78417132a195cbb74975346462410f72612952a7c4ade7e438': {
        pledge: '30000000000',
        margin: 0.03,
        fixedCost: '340000000',
        url: 'https://adalite.io/ADLT-metadata.json',
        name: 'AdaLite Stake Pool',
        ticker: 'ADLT',
        homepage: 'https://adalite.io/',
      },
    }

    fetchMock.mock({
      matcher: `${ADALITE_CONFIG.ADALITE_BLOCKCHAIN_EXPLORER_URL}/api/v2/stakePools`,
      response: {
        status: 200,
        body: stakePoolsMock,
        sendAsJson: true,
      },
    })
  }

  function mockGetConversionRates() {
    fetchMock.config.overwriteRoutes = true

    fetchMock.mock({
      matcher: 'https://min-api.cryptocompare.com/data/price?fsym=ADA&tsyms=USD,EUR',
      response: {
        status: 200,
        body: {
          USD: '0.08245',
          EUR: '0.07364',
        },
        sendAsJson: true,
      },
    })
  }

  function mockRawTxEndpoint() {
    fetchMock.config.overwriteRoutes = true

    const requestsAndResponses = {
      '6ca5fde47f4ff7f256a7464dbf0cb9b4fb6bce9049eee1067eed65cf5d6e2765': {
        Right:
          '839f8200d8185824825820aa22f977c2671836647d347ebe23822269ce21cd22f231e1279018b569dcd48c008200d8185824825820aa22f977c2671836647d347ebe23822269ce21cd22f231e1279018b569dcd48c01ff9f8282d818584283581c2cdf2a4727c91392bcd1dc1df64e4b5a3a3ddb5645226616b651b90aa101581e581c140539c64edded60a7f2d3693300e8b2463207803127d23562295bf3001a5562e2a21a000186a08282d818584283581cfcca7f1da7a330be2cb4ff273e3b8e2bd77c3cdcd3e8d8381e0d9e49a101581e581c140539c64edded60a7f2de696f5546c042bbc8749c95e836b09b7884001aead6cd071a002bc253ffa0',
      },
    }
    for (const request in requestsAndResponses) {
      fetchMock.mock({
        matcher: `${ADALITE_CONFIG.ADALITE_BLOCKCHAIN_EXPLORER_URL}/api/txs/raw/${request}`,
        response: {
          status: 200,
          body: requestsAndResponses[request],
          sendAsJson: true,
        },
      })
    }
  }

  function mockTransactionSubmitter() {
    fetchMock.config.overwriteRoutes = true

    const requestsAndResponses = {
      '{"txHash":"fbc75523d969d65caf94e9ab4e689e220ee3d7380319db75cef90273f3ad68dc","txBody":"82839f8200d81858248258206ca5fde47f4ff7f256a7464dbf0cb9b4fb6bce9049eee1067eed65cf5d6e2765008200d81858248258206ca5fde47f4ff7f256a7464dbf0cb9b4fb6bce9049eee1067eed65cf5d6e276501ff9f8282d818584283581c13f3997560a5b81f5ac680b3322a2339433424e4e589ab3d752afdb6a101581e581c2eab4601bfe583febc23a04fb0abc21557adb47cea49c68d7b2f40a5001ac63884bf182f8282d818584283581cf9a5257f805a1d378c87b0bfb09232c10d9098bc56fd21d9a6a4072aa101581e581c140539c64edded60a7f2c4692c460a154cbdd06088333fd7f75ea7e7001a0ff80ab91a002a81c7ffa0828200d81858858258406830165e81b0666850f36a4583f7a8a29b09e120f99852c56d37ded39bed1bb0464a98c35cf0f6458be6351d8f8527fb8b17fe6be0523e901d9562c2b7a52a9e584020278d74d3650abba727b78c314f7d0565778fc7a80f72918c909ddc03553c2f04b768673b9c3132b172aa01ec9c666598d10f2ac968a58c92ab9ce7fb3bd50d8200d81858858258400093f68540416f4deea889da21af1f1760edc3478bcac204a3013a046327c29c1748af9d186a7e463caa63ef2c660e5f2a051ad014a050d1b27e636128e1947e5840174f2976ee75a1b2129c4330f022863e5a4572247f18e2d4437f5b2c711506c23732d64f14ba44ba980364430ad1eca7d3b222828db2048d8e67c6224958d102"}': {
        Right: {
          txHash: 'fbc75523d969d65caf94e9ab4e689e220ee3d7380319db75cef90273f3ad68dc',
        },
      },
    }
    // eslint-disable-next-line guard-for-in
    for (const request in requestsAndResponses) {
      fetchMock.mock({
        // eslint-disable-next-line no-loop-func
        matcher: (url, opts) => {
          return (
            url === `${ADALITE_CONFIG.ADALITE_SERVER_URL}/api/txs/submit` &&
            opts &&
            opts.body === request
          )
        },
        response: {
          status: 200,
          body: requestsAndResponses[request],
          sendAsJson: true,
        },
      })
    }

    fetchMock.mock({
      matcher: `${ADALITE_CONFIG.ADALITE_SERVER_URL}/api/txs/submit`,
      response: {
        status: 200,
        body: {
          Left: 'Transaction rejected by network',
        },
        sendAsJson: true,
      },
    })
  }

  function mockUtxoEndpoint() {
    fetchMock.config.overwriteRoutes = true

    fetchMock.post({
      name: `${ADALITE_CONFIG.ADALITE_BLOCKCHAIN_EXPLORER_URL}/api/bulk/addresses/utxo`,
      matcher: `${ADALITE_CONFIG.ADALITE_BLOCKCHAIN_EXPLORER_URL}/api/bulk/addresses/utxo`,
      response: (url, options) => {
        let utxos = []
        JSON.parse(options.body).forEach((addr) => {
          if (utxoMock[addr]) utxos = utxos.concat(utxoMock[addr])
        })
        return {
          status: 200,
          body: {Right: utxos},
          sendAsJson: true,
        }
      },
    })
  }

  function mockPoolMeta() {
    fetchMock.post({
      matcher: `${ADALITE_CONFIG.ADALITE_SERVER_URL}/api/poolMeta`,
      response: {
        status: 200,
        body: {
          name: 'XXXX',
          description: 'This pool allows us to sustain and improve our free services',
          ticker: 'TEST',
          homepage: 'https://testtest.io',
        },
        sendAsJson: true,
      },
    })
  }

  function mockGetAccountState() {
    fetchMock.post({
      matcher: 'https://iohk-mainnet.yoroiwallet.com/api/getAccountState',
      response: {
        status: 200,
        body: {
          e1c3892366f174a76af9252f78368f5747d3055ab3568ea3b6bf40b01e: {
            remainingAmount: '0',
            rewards: '',
            withdrawals: '',
            poolOperator: null,
          },
        },
        sendAsJson: true,
      },
    })
  }

  function mockAccountDelegationHistory() {
    fetchMock.mock({
      matcher: `begin:${ADALITE_CONFIG.ADALITE_BLOCKCHAIN_EXPLORER_URL}/api/account/delegationHistory/`,
      response: {
        status: 200,
        body: [
          {
            epochNo: 211,
            time: '2020-08-17T15:04:30.000Z',
            poolHash: '0f292fcaa02b8b2f9b3c8f9fd8e0bb21abedb692a6d5058df3ef2735',
            txHash: '3526d8d772238c975e22ed654161b97c8d99e7601ae97ede930b9cc57c52c8a0',
          },
          {
            epochNo: 209,
            time: '2020-08-08T11:09:51.000Z',
            poolHash: 'df1750df9b2df285fcfb50f4740657a18ee3af42727d410c37b86207',
            txHash: 'b84471f9dda4e5381f8986b0db8cfe9ebaf88472c68076af326d88b46ae915e7',
          },
        ],
        sendAsJson: true,
      },
    })
  }

  function mockAccountStakeRegistrationHistory() {
    fetchMock.mock({
      matcher: `begin:${ADALITE_CONFIG.ADALITE_BLOCKCHAIN_EXPLORER_URL}/api/account/stakeRegistrationHistory/`,
      response: {
        status: 200,
        body: [
          {
            epochNo: 208,
            time: '2020-07-30T11:26:51.000Z',
            action: 'registration',
            txHash: '53f474e786f79b4b25bdfc51cfd6f5f018b28d951545b5d7d219f2601a9a0083',
          },
        ],
        sendAsJson: true,
      },
    })
  }

  function mockWithdrawalHistory() {
    fetchMock.mock({
      matcher: `begin:${ADALITE_CONFIG.ADALITE_BLOCKCHAIN_EXPLORER_URL}/api/account/withdrawalHistory/`,
      response: {
        status: 200,
        body: [],
        sendAsJson: true,
      },
    })
  }

  function mockRewardHistory() {
    fetchMock.mock({
      matcher: `begin:${ADALITE_CONFIG.ADALITE_BLOCKCHAIN_EXPLORER_URL}/api/account/rewardHistory/`,
      response: {
        status: 200,
        body: [],
        sendAsJson: true,
      },
    })
  }

  function mockPoolRecommendation() {
    fetchMock.mock({
      matcher: `begin:${ADALITE_CONFIG.ADALITE_BLOCKCHAIN_EXPLORER_URL}/api/account/poolRecommendation/`,
      response: {
        status: 200,
        body: {
          recommendedPoolHash: ADALITE_CONFIG.ADALITE_STAKE_POOL_ID,
          isInRecommendedPoolSet: true,
          status: 'GivedPoolOk',
        },
        sendAsJson: true,
      },
    })
  }

  return {
    mockBulkAddressSummaryEndpoint,
    mockGetAccountInfo,
    mockGetStakePools,
    mockGetConversionRates,
    mockTransactionSubmitter,
    mockUtxoEndpoint,
    mockRawTxEndpoint,
    mockPoolMeta,
    mockGetAccountState,
    mockAccountDelegationHistory,
    mockAccountStakeRegistrationHistory,
    mockWithdrawalHistory,
    mockRewardHistory,
    mockPoolRecommendation,
    clean,
  }
}

export default mock
