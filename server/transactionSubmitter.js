require('isomorphic-fetch')

module.exports = function(app, env) {
  // eslint-disable-next-line consistent-return
  app.post('/api/txs/submit', async (req, res) => {
    let txHash
    let txBody
    try {
      txHash = req.body.txHash
      txBody = req.body.txBody
      if (!txHash || !txBody) throw new Error('bad format')
    } catch (err) {
      return res.json({
        Left: 'Bad request body',
      })
    }

    const signedBody = {
      signedTx: Buffer.from(txBody, 'hex').toString('base64'),
    }

    try {
      const response = await fetch(
        `${process.env.ADALITE_BLOCKCHAIN_EXPLORER_URL}/api/v2/txs/signed`,
        {
          method: 'POST',
          body: JSON.stringify(signedBody),
          headers: {
            'Content-Type': 'application/json; charset=utf-8',
          },
        }
      )
      if (response.status === 200) {
        return res.json({
          Right: {txHash},
        })
      }
      return res.json({
        Left: 'Transaction rejected by network',
      })
    } catch (err) {
      return res.json({
        Left: 'An unexpected error has occurred',
      })
    }
  })
}
