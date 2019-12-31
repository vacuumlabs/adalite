require('isomorphic-fetch')

module.exports = function(app, env) {
  // eslint-disable-next-line consistent-return
  app.post('/api/testnet/txs/signed', async (req, res) => {
    const tx = req.body.hexData
    const buff = Buffer.from(tx, 'hex')
    try {
      const response = await fetch(
        `${process.env.ADALITE_BLOCKCHAIN_EXPLORER_URL}/api/v2/txs/signed`,
        {
          method: 'POST',
          body: buff,
          headers: {
            'content-Type': 'application/octet-stream',
          },
        }
      )
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

  app.post('/api/testnet/account/info', async (req, res) => {
    const account = req.body.accountPubkeyHex
    try {
      const response = await fetch(
        `${process.env.ADALITE_BLOCKCHAIN_EXPLORER_URL}/api/v2/account/info`,
        {
          method: 'POST',
          body: JSON.stringify({
            account,
          }),
          headers: {
            'content-Type': 'application/json',
          },
        }
      )
      const responseJson = await response.json()
      if (response.status === 200) {
        return res.json({
          Right: responseJson,
        })
      }
      return res.json({
        Left: responseJson,
      })
    } catch (err) {
      return res.json({
        Left: err,
      })
    }
  })

  app.post('/api/testnet/account/delegationHistory', async (req, res) => {
    const account = req.body.extendedPubKey
    const limit = req.body.limit
    console.log(account)
    console.log(limit)
    try {
      const response = await fetch(
        `${process.env.ADALITE_BLOCKCHAIN_EXPLORER_URL}/api/v2/account/delegationHistory`,
        {
          method: 'POST',
          body: JSON.stringify({
            limit,
            account,
          }),
          headers: {
            'content-Type': 'application/json',
          },
        }
      )
      let responseJson = await response.text()
      responseJson = JSON.parse(responseJson)
      console.log(responseJson)
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

  // app.post('/api/testnet/node/settings', async (req, res) => {
  //   try {
  //     const response = await fetch(`${process.env.ADALITE_JORMUNGANDR_NODE_URL}/api/v0/settings`)
  //     const responseJson = await response.json()

  //     if (response.status === 200) {
  //       return res.json({
  //         Right: responseJson,
  //       })
  //     }
  //     return res.json({
  //       Left: response.status,
  //     })
  //   } catch (err) {
  //     return res.json({
  //       Left: err,
  //     })
  //   }
  // })

  app.post('/api/testnet/pools', async (req, res) => {
    try {
      const response = await fetch(
        `${process.env.ADALITE_BLOCKCHAIN_EXPLORER_URL}/api/v2/stakePools`
      )
      let responseJson = await response.text()
      responseJson = JSON.parse(responseJson)
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
