require('isomorphic-fetch')
const Sentry = require('@sentry/node')

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

      const errorMessage = await response.text()

      // eslint-disable-next-line no-console
      console.error(
        `Submission of tx ${txHash} failed with status ${response.status} and message ${errorMessage}`
      )

      Sentry.captureException(new Error('TransactionSubmissionFailed'), {
        contexts: [{...JSON.parse(errorMessage)}],
      })

      return res.json({
        Left: `Transaction rejected by network - ${errorMessage}`,
        statusCode: response.status,
      })
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error(`Submission of tx ${txHash} failed with an unexpected error: ${err.stack}`)
      Sentry.captureException(e)
      return res.json({
        Left: 'An unexpected error has occurred',
      })
    }
  })
}
