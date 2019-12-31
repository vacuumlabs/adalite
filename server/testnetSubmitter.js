require('isomorphic-fetch')

module.exports = function(app, env) {
  // eslint-disable-next-line consistent-return
  app.post('/api/testnet/txs/submit', async (req, res) => {
    const tx = req.body.hexData
    const buff = Buffer.from(tx, 'hex')
    try {
      const response = await fetch(`${process.env.ADALITE_JORMUNGANDR_NODE_URL}/api/v0/message`, {
        method: 'POST',
        body: buff,
        headers: {
          'content-Type': 'application/octet-stream',
        },
      })
      console.log(response.status)
      if (response.status === 200) {
        return res.json({
          Right: response.status,
        })
      }
      return res.json({
        Left: response.status,
      })
    } catch (err) {
      return res.json({
        Left: err,
      })
    }
  })

  app.post('/api/testnet/account/status', async (req, res) => {
    const accountPubkeyHex = req.body.accountPubkeyHex
    try {
      const response = await fetch(
        `${process.env.ADALITE_JORMUNGANDR_NODE_URL}/api/v0/account/${accountPubkeyHex}`
      )
      // console.log(res)
      // console.log(await res.json())
      const responseJson = await response.json()
      if (response.status === 200) {
        return res.json({
          Right: responseJson,
        })
      }
      return res.json({
        Left: response.status,
      })
    } catch (err) {
      return res.json({
        Left: err,
      })
    }
  })

  app.post('/api/testnet/node/settings', async (req, res) => {
    try {
      const response = await fetch(`${process.env.ADALITE_JORMUNGANDR_NODE_URL}/api/v0/settings`)
      // console.log(res)
      // console.log(await res.json())
      const responseJson = await response.json()

      if (response.status === 200) {
        return res.json({
          Right: responseJson,
        })
      }
      return res.json({
        Left: response.status,
      })
    } catch (err) {
      return res.json({
        Left: err,
      })
    }
  })

  app.post('/api/testnet/pools', async (req, res) => {
    try {
      const response = await fetch(`${process.env.ADALITE_JORMUNGANDR_NODE_URL}/api/v0/stake_pools`)
      // console.log(response)
      // console.log()
      let responseJson = await response.text()
      responseJson = JSON.parse(responseJson)
      // console.log(responseJson)
      if (response.status === 200) {
        return res.json({
          Right: responseJson,
        })
      }
      return res.json({
        Left: response.status,
      })
    } catch (err) {
      return res.json({
        Left: err,
      })
    }
  })
}
