require('isomorphic-fetch')
const Sentry = require('@sentry/node')
const {backendConfig} = require('./helpers/loadConfig')
const cacheResults = require('./helpers/cacheResults')

const CACHE_TIMEOUT = 24 * 60 * 60 * 1000 // 1 day

const cachedFetch = cacheResults(CACHE_TIMEOUT)(async (url) => {
  const response = await fetch(url)
  if (response.status === 200) {
    return response.json()
  } else {
    return null
  }
})

module.exports = function(app, env) {
  app.post('/api/bulk/tokens/metadata', async (req, res) => {
    try {
      const responses = await Promise.all(
        req.body.subjects.map((subject) =>
          cachedFetch(`${backendConfig.ADALITE_TOKEN_REGISTRY_URL}/metadata/${subject}`)
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
