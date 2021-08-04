require('isomorphic-fetch')
const Sentry = require('@sentry/node')
const {backendConfig} = require('./helpers/loadConfig')
const cachedFetch = require('./helpers/cachedFetch')

const CACHE_TIMEOUT = 24 * 60 * 60 * 1000 // 1 day

module.exports = function(app, env) {
  app.post('/api/bulk/tokens/metadata', async (req, res) => {
    try {
      const responses = await Promise.all(
        req.body.subjects.map((subject) =>
          cachedFetch(
            'tokenRegistry:',
            `${backendConfig.ADALITE_TOKEN_REGISTRY_URL}/metadata/${subject}`,
            CACHE_TIMEOUT
          )
        )
      )

      const tokensMetadata = await Promise.all(responses.filter((e) => e !== null))

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
