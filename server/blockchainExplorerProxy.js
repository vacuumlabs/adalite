require('isomorphic-fetch')

module.exports = function(app, env) {
  app.get('/api/addresses/summary/:address', async (req, res) => {
    const address = req.params.address

    const response = await request(
      `${process.env.CARDANOLITE_BLOCKCHAIN_EXPLORER_PROXY_TARGET}/api/addresses/summary/${address}`
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
        `${process.env.CARDANOLITE_BLOCKCHAIN_EXPLORER_PROXY_TARGET}/api/bulk/addresses/utxo`,
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
