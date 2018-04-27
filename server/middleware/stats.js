const redis = require('redis')
const config = require('../helpers/backendConfigLoader')
const client = redis.createClient(config.REDIS_URL)

const knownIps = new Set()

const monthNames = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
]

module.exports = (req, res, next) => {
  // 'x-forwarded-for' due to internal heroku routing
  const ip = req.headers['x-forwarded-for']
  if (!knownIps.has(ip)) {
    const date = new Date()
    knownIps.add(ip)
    client.incr('total')
    client.incr(`${monthNames[date.getMonth()]}-${date.getFullYear()}`)
    client.incr(
      `${date.getDate()}.${date.getMonth() + 1}.${date.getFullYear()}`
    )
  }
  next()
}
