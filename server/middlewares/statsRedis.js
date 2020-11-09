const redis = require('redis')
const device = require('device')
const client = redis.createClient(process.env.REDIS_URL)
const mung = require('express-mung')
const normalizeUrl = require('normalize-url')
const {parseTxBodyOutAmount, parseTxBodyTotalAmount} = require('../helpers/parseTxBody')
const {captureException} = require('@sentry/node')

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

const tokenMatches = (token) => token === process.env.ADALITE_BACKEND_TOKEN

const incrCountersBy = (key, value) => {
  const [year, month, day] = getSlicedDate()
  client.incrby(`${key}:total`, value)
  client.incrby(`${key}:monthly:${year}-${month}`, value)
  client.incrby(`${key}:daily:${year}-${month}-${day}`, value)
}

const trackVisits = (req, res, next) => {
  // 'x-forwarded-for' due to internal heroku routing
  const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress

  const mydevice = device(req.headers['user-agent'])

  if (!knownIps.has(ip) && !mydevice.is('bot')) {
    knownIps.add(ip)
    incrCountersBy('visits', 1)
  }

  next()
}

const trackTxSubmissions = mung.json((body, req, res) => {
  if (req.originalUrl === '/api/txs/submit' && req.method === 'POST') {
    const txSubmissionType =
      tokenMatches(req.get('token')) &&
      isSameOrigin(req.get('origin'), process.env.ADALITE_SERVER_URL)
        ? 'txSubmissions'
        : 'otherTxSubmissions'
    const txSubmissionSuccess = body.Right ? 'successful' : 'unsuccessful'

    incrCountersBy(`${txSubmissionType}:${txSubmissionSuccess}`, 1)

    if (txSubmissionSuccess === 'successful') {
      const {txBody} = req.body
      let txOutAmount = 0
      let txTotalAmount = 0

      try {
        txOutAmount = parseTxBodyOutAmount(txBody)
        txTotalAmount = parseTxBodyTotalAmount(txBody)
      } catch (e) {
        // eslint-disable-next-line no-console
        console.error(e)
        captureException(e)
      }

      incrCountersBy(`${txSubmissionType}:sentOut`, txOutAmount)
      incrCountersBy(`${txSubmissionType}:sentTotal`, txTotalAmount)
    }
  }
})

module.exports = {
  trackVisits,
  trackTxSubmissions,
}
