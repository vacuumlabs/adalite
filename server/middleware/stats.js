const redis = require('redis')
const device = require('device')
const client = redis.createClient(process.env.REDIS_URL)

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

  const mydevice = device(req.headers['user-agent'])

  if (!knownIps.has(ip) && !mydevice.is('bot')) {
    const date = new Date()
    knownIps.add(ip)
    client.incr('total')
    client.incr(`${monthNames[date.getMonth()]}-${date.getFullYear()}`)
    client.incr(`${date.getDate()}.${date.getMonth() + 1}.${date.getFullYear()}`)
  }
  next()
}
