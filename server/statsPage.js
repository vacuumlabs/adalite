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

  const getPrecedence = (val, precedenceFn) => {
    const subKeys = val.split(':')

    for (const subKey of subKeys) {
      const result = precedenceFn(subKey)
      if (result !== -1) {
        return result
      }
    }

    return -1
  }

  const cmpBySubKey = (a, b, precedenceFn) => {
    return getPrecedence(a, precedenceFn) - getPrecedence(b, precedenceFn)
  }

  return result.sort((a, b) => {
    // the "total" results will be the uppermost, followed by monthly and daily stats respectively
    const topLevelCmpResult = cmpBySubKey(a[0], b[0], (x) =>
      ['total', 'monthly', 'daily'].indexOf(x)
    )

    if (topLevelCmpResult !== 0) {
      return topLevelCmpResult
    }

    // the monthly and daily stats will be sorted from latest to soonest
    const dateCmpResult = cmpBySubKey(a[0], b[0], (x) => Date.parse(x) || -1)
    if (dateCmpResult !== 0) {
      return dateCmpResult
    }

    // finally records within the same group and with the same date will be sorted alphabetically
    return a[0].localeCompare(b[0])
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
            <meta charset="utf-8"/>
            <title>CardanoLite Wallet Stats</title>
            <link rel="icon" type="image/ico" href="assets/favicon.ico">
          </head>
      
          <body>
            Stats of transaction submissions and estimates of unique IPs visits per day, month and in total.
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
