const fetchMock = require('fetch-mock')
const singleAddressesMock = require('./singleAddressesMock')
const bulkSummaryRequests = require('./bulkSummaryRequests')
const utxoMock = require('./utxoMock')

const mock = (ADALITE_CONFIG) => {
  function clean() {
    fetchMock.restore()
  }

  function mockBulkAddressSummaryEndpoint() {
    fetchMock.config.overwriteRoutes = true

    const requestsAndResponses = {}

    bulkSummaryRequests.forEach((request) => {
      const response = {
        Right: {
          caAddresses: [],
          caTxNum: 0,
          caBalance: {getCoin: 0},
          caTxList: [],
        },
      }
      request.forEach((address) => {
        const singleResponse = singleAddressesMock[address]
        if (singleResponse) {
          response.Right.caAddresses.push(address)
          //eslint-disable-next-line max-len
          response.Right.caBalance.getCoin = (
            parseInt(response.Right.caBalance.getCoin, 10) +
            parseInt(singleResponse.Right.caBalance.getCoin, 10)
          ).toString()
          response.Right.caTxNum = response.Right.caTxNum + singleResponse.Right.caTxNum
          response.Right.caTxList = [...response.Right.caTxList, ...singleResponse.Right.caTxList]
        } else {
          throw Error(`Address missing in singleAddressesMock: ${address}`)
        }
      })
      requestsAndResponses[JSON.stringify(request)] = response
    })

    for (const request in requestsAndResponses) {
      fetchMock.post({
        name: `${
          ADALITE_CONFIG.ADALITE_BLOCKCHAIN_EXPLORER_URL
        }/api/bulk/addresses/summary${request}`,
        matcher: (url, opts) => {
          return (
            url ===
              `${ADALITE_CONFIG.ADALITE_BLOCKCHAIN_EXPLORER_URL}/api/bulk/addresses/summary` &&
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
      '{"txHash":"73131c773879e7e634022f8e0175399b7e7814c42684377cf6f8c7a1adb23112","txBody":"82839f8200d81858248258206ca5fde47f4ff7f256a7464dbf0cb9b4fb6bce9049eee1067eed65cf5d6e2765008200d81858248258206ca5fde47f4ff7f256a7464dbf0cb9b4fb6bce9049eee1067eed65cf5d6e276501ff9f8282d818584283581c13f3997560a5b81f5ac680b3322a2339433424e4e589ab3d752afdb6a101581e581c2eab4601bfe583febc23a04fb0abc21557adb47cea49c68d7b2f40a5001ac63884bf182f8282d818584283581cab41e66f954dd7f1c16081755eb02ee61dc720bd9e05790f9de649b7a101581e581c140539c64edded60a7f2d169cb4da86a47bccc6a92e4130754fd0f36001a306ccb8f1a002a8c6cffa0828200d81858858258406830165e81b0666850f36a4583f7a8a29b09e120f99852c56d37ded39bed1bb0464a98c35cf0f6458be6351d8f8527fb8b17fe6be0523e901d9562c2b7a52a9e5840951e97f421d44345f260f5d84070c93a0dbc7dfa883a2cbedb1cedee22cb86b459450d615d580d9a3bd49cf09f2848447287cf306f09115d831276cac42919088200d81858858258400093f68540416f4deea889da21af1f1760edc3478bcac204a3013a046327c29c1748af9d186a7e463caa63ef2c660e5f2a051ad014a050d1b27e636128e1947e5840f44da425f699c39ca539c6e2e2262ed4a4b977dd8bdbb4450d40ab7503dc9b4ebca68a8f819d1f92bfdd2af2825b26bb07ef1f586c1135a88b1cdc8520142208"}': {
        Right: {
          txHash: '73131c773879e7e634022f8e0175399b7e7814c42684377cf6f8c7a1adb23112',
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

    const requestsAndResponses = utxoMock

    // eslint-disable-next-line guard-for-in
    for (const request in requestsAndResponses) {
      fetchMock.post({
        name: `${ADALITE_CONFIG.ADALITE_BLOCKCHAIN_EXPLORER_URL}/api/bulk/addresses/utxo${request}`,
        matcher: (url, opts) => {
          return (
            url === `${ADALITE_CONFIG.ADALITE_BLOCKCHAIN_EXPLORER_URL}/api/bulk/addresses/utxo` &&
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
  }

  return {
    mockBulkAddressSummaryEndpoint,
    mockTransactionSubmitter,
    mockUtxoEndpoint,
    mockRawTxEndpoint,
    clean,
  }
}

module.exports = mock
