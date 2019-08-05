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
      return res.json({
        Left: 'Bad request body',
      })
    }

    await sleep(5000)

    const success = process.env.ADALITE_MOCK_TX_SUBMISSION_SUCCESS === 'true'

    return success
      ? res.json({
        Right: {txHash},
      })
      : res.json({
        Left: 'Transaction rejected by network',
      })
  })

  app.get('/api/txs/summary/:txHash', async (req, res) => {
    let response

    if (process.env.ADALITE_MOCK_TX_SUMMARY_SUCCESS === 'true') {
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

    return res.json(response)
  })

  app.post('/api/emails/submit', async (req, res) => {
    const listId = 'c48db9ac44' // move to config
    const APIKey = require('./APIKEY') // move to config - replace with your own mailchimp API key for testing
    const dataCenter = 'us9' // move to config

    let email
    try {
      email = req.body.email
      if (!email) throw new Error('bad format')
    } catch (err) {
      return res.json({
        Left: 'Bad request body',
      })
    }

    try {
      const response = await fetch(
        `https://${dataCenter}.api.mailchimp.com/3.0/lists/${listId}/members/`,
        {
          method: 'POST',
          body: JSON.stringify({
            email_address: email,
            status: 'subscribed',
          }),
          headers: {
            'Content-Type': 'application/json; charset=utf-8',
            'Authorization': `Basic ${Buffer.from(`anystring:${APIKey}`).toString('base64')}`,
          },
        }
      )

      if (response.status === 200) {
        return res.json({
          Right: 'Successfuly subscribed',
        })
      }

      if (response.status === 400) {
        return res.json({
          Left: 'Member already exists or email is invalid',
        })
      }

      return res.json({
        Left: 'Email submission rejected by network',
      })
    } catch (err) {
      return res.json({
        Left: 'An unexpected error has happened',
      })
    }
  })

  // the remaining requests are redirected to the actual blockchain explorer
  app.get('/api/*', async (req, res) => {
    return res.json(
      await request(`${process.env.ADALITE_BLOCKCHAIN_EXPLORER_URL}${req.originalUrl}`)
    )
  })

  app.post('/api/*', async (req, res) => {
    return res.json(
      await request(
        `${process.env.ADALITE_BLOCKCHAIN_EXPLORER_URL}${req.originalUrl}`,
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
