const redis = require('redis')
const redisScan = require('redisscan')
const client = redis.createClient(process.env.REDIS_URL)

const getData = async () => {
  const result = []
  await new Promise((resolve, reject) => {
    redisScan({
      redis: client,
      each_callback(type, key, subkey, length, value, next) {
        result.push([key, value])
        next()
      },
      done_callback(err) {
        err ? reject() : resolve()
      },
    })
  })
  return result.sort((a, b) => {
    if (a[0] === 'total') return -1
    if (b[0] === 'total') return 1
    if (Math.sign(a[0].indexOf('-')) !== Math.sign(b[0].indexOf('-'))) {
      if (a[0].indexOf('-') !== -1) return -1
      if (b[0].indexOf('-') !== -1) return 1
    }
    // parse accepts the month.day.year format
    const parseTime = (t) => {
      if (t.indexOf('.') !== -1) {
        const tArr = t.split('.')
        return Date.parse(`${tArr[1]}.${tArr[0]}.${tArr[2]}`)
      }
      return Date.parse(t)
    }
    return parseTime(a[0]) - parseTime(b[0])
  })
}

module.exports = function(app, env) {
  app.get('/usage_stats', async (req, res) => {
    try {
      const table = (await getData())
        .map(
          (v) => `
        <tr>
          <td>${v[0]}</td>
          <td>${v[1]}</td>
        </tr>
      `
        )
        .join('')

      return res.status(200).send(`
        <!doctype html>
        <html>
          <head>
            <title>CardanoLite Wallet Stats</title>
            <link rel="icon" type="image/ico" href="assets/favicon.ico">
          </head>
      
          <body>
            Estimated number of unique IPs per day, aggregate for day/month/year
            <table>
              ${table}
            </table>
          </body>
      
        </html>
      `)
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error(e)
      return 'Something went wrong, bother the devs.'
    }
  })
}
