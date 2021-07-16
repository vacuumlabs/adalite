require('isomorphic-fetch')
const Sentry = require('@sentry/node')
const {backendConfig} = require('./helpers/loadConfig')

module.exports = function(app, env) {
  app.post('/api/tokenRegistry/getTokensMetadata', async (req, res) => {
    try {
      const responses = await Promise.all(
        req.body.subjects.map((subject) =>
          fetch(`${backendConfig.TOKEN_REGISTRY_URL}/metadata/${subject}`)
        )
      )

      const tokensMetadata = await Promise.all(
        responses
          .map((response) => {
            if (response.status === 200) {
              return response.json()
            } else {
              return null
            }
          })
          .filter((e) => e !== null)
      )

      return res.json({
        Right: tokensMetadata,
      })
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error(`Call to Token Registry failed with an unexpected error: ${err.stack}`)
      Sentry.captureException(err)
      return res.json({
        statusCode: 500,
        Left: 'An unexpected error has occurred',
      })
    }
  })
}
