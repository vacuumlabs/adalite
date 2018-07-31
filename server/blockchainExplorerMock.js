require('isomorphic-fetch')
const sleep = require('./helpers/sleep')

/*
* The mocking is only partial. Currently it's just for the purpose of mocking tx submission
* and subsequent polling for tx status. The other requests are real.
*/

module.exports = function(app, env) {
  app.get('/api/addresses/summary/:address', async (req, res) => {
    const address = req.params.address

    const response = await request(
      `${process.env.CARDANOLITE_BLOCKCHAIN_EXPLORER_URL}/api/addresses/summary/${address}`
    )

    return res.status(200).send(response)
  })

  app.get('/api/txs/raw/:txId', async (req, res) => {
    const txId = req.params.txId

    const response = await request(
      `${process.env.CARDANOLITE_BLOCKCHAIN_EXPLORER_URL}/api/txs/raw/${txId}`
    )

    return res.status(200).send(response)
  })

  app.post('/api/bulk/addresses/utxo', async (req, res) => {
    const addresses = req.body
    const result = {
      Right: [],
    }

    for (let i = 0; i < addresses.length; i += 10) {
      const response = await request(
        `${process.env.CARDANOLITE_BLOCKCHAIN_EXPLORER_URL}/api/bulk/addresses/utxo`,
        'POST',
        JSON.stringify(addresses.slice(i, i + 10)),
        {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        }
      )

      result.Right = result.Right.concat(response.Right)
    }

    return res.status(200).send(result)
  })

  app.get('/api/txs/summary/:txId', async (req, res) => {
    const txId = req.params.txId
    await sleep(1000)
    let response

    if (process.env.CARDANOLITE_MOCK_TX_SUMMARY_SUCCESS === 'true') {
      response = {
        Right: {
          ctsId: txId,
        },
      }
    } else {
      response = {
        Letf: 'Transaction missing in MemPool!',
      }
    }

    return res.status(200).send(response)
  })
}

async function request(url, method = 'get', body = null, headers = {}) {
  const res = await fetch(url, {
    method,
    headers,
    body,
  })
  if (res.status >= 400) {
    throw new Error(res.status)
  }

  return res.json()
}
