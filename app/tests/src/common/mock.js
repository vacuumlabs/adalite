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
          caBalance: {getCoin: 0},
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
      delegation: [],
      value: 0,
      counter: 0,
      last_rewards: {
        epoch: 0,
        reward: 0,
      },
    }

    fetchMock.mock({
      matcher: `${ADALITE_CONFIG.ADALITE_BLOCKCHAIN_EXPLORER_URL}/api/v2/account/info`,
      response: {
        status: 200,
        body: acctInfoMock,
        sendAsJson: true,
      },
    })
  }

  function mockGetStakePools() {
    fetchMock.config.overwriteRoutes = true

    const stakePoolsMock = [
      {
        pool_id: 'd4b1243dfc0bec57f146a90d85b478cdd3e0e646c43801c2bebd6792580a7db2',
        owner: 'def7e265ec2c54e1cf00dae85ec407e823dd1374e6520cd59264df321513ffe5',
        name: 'IOHK Stakepool',
        description: null,
        ticker: 'IOHK1',
        homepage: 'https://staking.cardano.org',
        rewards: {
          fixed: 258251123,
          ratio: [2, 25],
          limit: null,
        },
      },
    ]

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
      '{"txHash":"5e3c57744fb9b134589cb006db3d6536cd6471a2bde542149326dd92859f0a93","txBody":"82839f8200d81858248258206ca5fde47f4ff7f256a7464dbf0cb9b4fb6bce9049eee1067eed65cf5d6e2765008200d81858248258206ca5fde47f4ff7f256a7464dbf0cb9b4fb6bce9049eee1067eed65cf5d6e276501ff9f8282d818584283581c13f3997560a5b81f5ac680b3322a2339433424e4e589ab3d752afdb6a101581e581c2eab4601bfe583febc23a04fb0abc21557adb47cea49c68d7b2f40a5001ac63884bf182f8282d818584283581cf9a5257f805a1d378c87b0bfb09232c10d9098bc56fd21d9a6a4072aa101581e581c140539c64edded60a7f2c4692c460a154cbdd06088333fd7f75ea7e7001a0ff80ab91a002a8c6cffa0828200d81858858258406830165e81b0666850f36a4583f7a8a29b09e120f99852c56d37ded39bed1bb0464a98c35cf0f6458be6351d8f8527fb8b17fe6be0523e901d9562c2b7a52a9e5840337f577d102af20120ade17d54821b1e40a218ddf9ca29dd4fd46f7394b0c7d9abc6c4d9ac46d592c83dea1d31465665614b7198c4ceef00632e6b48e13490088200d81858858258400093f68540416f4deea889da21af1f1760edc3478bcac204a3013a046327c29c1748af9d186a7e463caa63ef2c660e5f2a051ad014a050d1b27e636128e1947e5840982ffc1339a390bbd26948ab64fd6510f557e9c7cb04e665dd168797822e156335affdce50e08831b6532304450e4e490d805b9ed184b7f6ce64107b0b16c102"}': {
        Right: {
          txHash: '5e3c57744fb9b134589cb006db3d6536cd6471a2bde542149326dd92859f0a93',
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

  return {
    mockBulkAddressSummaryEndpoint,
    mockGetAccountInfo,
    mockGetStakePools,
    mockGetConversionRates,
    mockTransactionSubmitter,
    mockUtxoEndpoint,
    mockRawTxEndpoint,
    clean,
  }
}

export default mock
