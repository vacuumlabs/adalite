const redis = require('redis')
const device = require('device')
const client = redis.createClient(process.env.REDIS_URL)
const mung = require('express-mung')
const normalizeUrl = require('normalize-url')

const knownIps = new Set()

function getSlicedDate() {
  return new Date()
    .toISOString()
    .split('T')[0]
    .split('-')
}

const isSameOrigin = (urlString1, urlString2) => {
  return (
    normalizeUrl(urlString1, {stripProtocol: true}) ===
    normalizeUrl(urlString2, {stripProtocol: true})
  )
}

const trackVisits = (req, res, next) => {
  // 'x-forwarded-for' due to internal heroku routing
  const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress

  const mydevice = device(req.headers['user-agent'])

  if (!knownIps.has(ip) && !mydevice.is('bot')) {
    const [year, month, day] = getSlicedDate()

    knownIps.add(ip)
    client.incr('visits:total')
    client.incr(`visits:monthly:${year}-${month}`)
    client.incr(`visits:daily:${year}-${month}-${day}`)
  }

  next()
}

const trackTxSubmissionCount = mung.json((body, req, res) => {
  if (req.originalUrl === '/api/txs/submit' && req.method === 'POST') {
    const [year, month, day] = getSlicedDate()
    const key = `${
      isSameOrigin(req.get('origin'), process.env.ADALITE_SERVER_URL)
        ? 'txSubmissions'
        : 'otherTxSubmissions'
    }:${body.Right ? 'successful' : 'unsuccessful'}`

    client.incr(`${key}:total`)
    client.incr(`${key}:monthly:${year}-${month}`)
    client.incr(`${key}:daily:${year}-${month}-${day}`)
  }
})

module.exports = {
  trackVisits,
  trackTxSubmissionCount,
}
