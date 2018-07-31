const sleep = require('./helpers/sleep')

module.exports = function(app, env) {
  app.post('/api/transactions', async (req, res) => {
    let txHash
    let txBody // [1, txBody] in CBOR
    try {
      txHash = req.body.txHash // as hexstring
      txBody = req.body.txBody // [1, txBody] in CBOR
      if (!txHash || !txBody) throw new Error('bad format')
    } catch (err) {
      return res.status(500).send('bad request format')
    }

    await sleep(5000)

    const success = process.env.CARDANOLITE_MOCK_TX_SUBMISSION_SUCCESS === 'true'

    return res.end(
      JSON.stringify({
        success,
        txHash,
        error: success ? undefined : 'TransactionRejectedByNetwork',
      })
    )
  })
}
