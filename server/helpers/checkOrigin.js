const normalizeUrl = require('normalize-url')

const isSameOrigin = (urlString1, urlString2) => {
  return (
    normalizeUrl(urlString1, {stripProtocol: true}) ===
    normalizeUrl(urlString2, {stripProtocol: true})
  )
}

const tokenMatches = (token) => token === process.env.ADALITE_BACKEND_TOKEN

module.exports = {
  isSameOrigin,
  tokenMatches,
}
