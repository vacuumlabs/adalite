require('isomorphic-fetch')
const Sentry = require('@sentry/node')
const {backendConfig} = require('./helpers/loadConfig')
const chunk = require('./helpers/chunk')
const Cache = require('./helpers/cache')

const REQUEST_CHUNK_SIZE = 100
const MAX_REQUEST_SIZE = 2000

const cache = (() => {
  // We expect far more tokens to not be in token registry, we keep that information in nullCache
  // Keeping it separate helps us to not prune cached information about tokens that have real
  // metadata in token registry
  const cache = new Cache(1000)
  const nullCache = new Cache(100000)

  const get = (key) => {
    const value = cache.get(key)
    if (value === undefined) return nullCache.get(key)
    return value
  }

  const set = (key, value) => {
    if (value === null) {
      nullCache.set(key, value)
    } else {
      cache.set(key, value)
    }
  }

  return {get, set}
})()

module.exports = function(app, env) {
  app.post('/api/bulk/tokens/metadata', async (req, res) => {
    try {
      const subjects = req.body.subjects

      if (subjects.length > MAX_REQUEST_SIZE) {
        return res.json({
          statusCode: 400,
          Left: 'Request over max limit',
        })
      }

      // Retrieve subjects that are cached form cache and determine
      // which subjects need to be fetched from remote
      const {cached: cachedTokensMetadata, toFetch} = subjects.reduce(
        (acc, subject) => {
          const cachedValue = cache.get(subject)
          if (cachedValue === undefined) {
            acc.toFetch.push(subject)
          } else {
            if (cachedValue !== null) acc.cached.push(cachedValue)
          }
          return acc
        },
        {cached: [], toFetch: []}
      )

      // Fetch subjects from remote that are not present in cache
      const responses = (
        await Promise.all(
          (
            await Promise.all(
              chunk(toFetch, REQUEST_CHUNK_SIZE).map((subjects) =>
                fetch(`${backendConfig.ADALITE_TOKEN_REGISTRY_URL}/metadata/query`, {
                  method: 'POST',
                  headers: {'Content-Type': 'application/json'},
                  body: JSON.stringify({subjects}),
                })
              )
            )
          ).flatMap((response) =>
            response.status === 200 ? response.json() : Promise.resolve(null)
          )
        )
      )
        .filter((e) => e !== null)
        .flatMap((response) => response?.subjects)

      // Cache entries with metadata
      responses.forEach((tokenMetadata) => cache.set(tokenMetadata.subject, tokenMetadata))

      // Cache entries with no metadata
      const diff = (arr1, arr2) => arr1.filter((x) => !arr2.includes(x))
      diff(
        toFetch,
        responses.map((response) => response.subject)
      ).forEach((entry) => cache.set(entry, null))

      const tokensMetadata = [...cachedTokensMetadata, ...responses]

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
