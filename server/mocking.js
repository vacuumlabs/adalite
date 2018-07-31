require('isomorphic-fetch')

const sleep = require('./helpers/sleep')

/*
* Mocking of blockchain explorer and transaction submitter for developement purposes
*/
module.exports = function(app, env) {
  app.post('/api/txs/submit', async (req, res) => {
    let txHash
    let txBody // [1, txBody] in CBOR
    try {
      txHash = req.body.txHash // as hexstring
      txBody = req.body.txBody // [1, txBody] in CBOR
      if (!txHash || !txBody) throw new Error('bad format')
    } catch (err) {
      return res.send(
        JSON.stringify({
          Left: 'Bad request body',
        })
      )
    }

    await sleep(5000)

    const success = process.env.CARDANOLITE_MOCK_TX_SUBMISSION_SUCCESS === 'true'

    return success
      ? res.end(
        JSON.stringify({
          Right: {txHash},
        })
      )
      : res.end(
        JSON.stringify({
          Left: 'Transaction rejected by network',
        })
      )
  })

  app.get('/api/txs/summary/:txHash', async (req, res) => {
    let response

    if (process.env.CARDANOLITE_MOCK_TX_SUMMARY_SUCCESS === 'true') {
      response = {
        Right: {
          ctsId: req.params.txHash,
        },
      }
    } else {
      response = {
        Left: 'Transaction missing in MemPool!',
      }
    }

    await sleep(1000)

    return res.send(JSON.stringify(response))
  })

  // the remaining requests are redirected to the actual blockchain explorer
  app.get('/api/*', async (req, res) => {
    return res.send(
      await request(`${process.env.CARDANOLITE_BLOCKCHAIN_EXPLORER_URL}${req.originalUrl}`)
    )
  })

  app.post('/api/*', async (req, res) => {
    return res.send(
      await request(
        `${process.env.CARDANOLITE_BLOCKCHAIN_EXPLORER_URL}${req.originalUrl}`,
        'POST',
        JSON.stringify(req.body),
        {
          'Content-Type': 'application/json; charset=utf-8',
        }
      )
    )
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
