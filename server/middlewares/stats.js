const redis = require('redis')
const device = require('device')
const client = redis.createClient(process.env.REDIS_URL)
const mung = require('express-mung')
const normalizeUrl = require('normalize-url')
const cbor = require('borc')

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

const parseTxBodyOutAmount = (txBody) => {
  /*
   * The following code works because AdaLite sends 1 or 2-output txs
   * depending on the presence of change address, and the first one
   * is always the amount intended to be sent out
   */
  try {
    const decoded = cbor.decode(txBody)

    // [txAux][outputs][0-th output][amount]
    return decoded[0][1][0][1]
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error(e)
    return 0
  }
}

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
    const txSubmissionType = isSameOrigin(req.get('origin'), process.env.ADALITE_SERVER_URL)
      ? 'txSubmissions'
      : 'otherTxSubmissions'
    const txSubmissionSuccess = body.Right ? 'successful' : 'unsuccessful'

    incrCountersBy(`${txSubmissionType}:${txSubmissionSuccess}`, 1)

    if (txSubmissionSuccess === 'successful') {
      const {txBody} = req.body
      const txOutAmount = parseTxBodyOutAmount(txBody)

      incrCountersBy(`${txSubmissionType}:volume`, txOutAmount)
    }
  }
})

module.exports = {
  trackVisits,
  trackTxSubmissions,
}
