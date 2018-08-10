const redis = require('redis')
const redisScan = require('redisscan')
const client = redis.createClient(process.env.REDIS_URL)

const getStats = async () => {
  const stats = {
    visits: {total: [], monthly: [], daily: []},
    txSubmissions: {
      'successful:total': [],
      'successful:monthly': [],
      'successful:daily': [],
      'unsuccessful:total': [],
      'unsuccessful:monthly': [],
      'unsuccessful:daily': [],
    },
  }

  const response = []
  await new Promise((resolve, reject) => {
    redisScan({
      redis: client,
      each_callback(type, key, subkey, length, value, next) {
        response.push([key, value])
        next()
      },
      done_callback(err) {
        err ? reject() : resolve()
      },
    })
  })

  response.sort((a, b) => b[0].localeCompare(a[0]))

  response.forEach((item) => {
    const nameTokens = item[0].split(':')
    const subject = nameTokens[0]

    let period = nameTokens[1]
    if (subject !== 'visits') {
      period = `${period}:${nameTokens[2]}`
    }

    stats[subject][period].push([nameTokens[nameTokens.length - 1], item[1]])
  })

  return stats
}

module.exports = function(app, env) {
  app.get('/usage_stats', async (req, res) => {
    try {
      const stats = await getStats()

      const statsHtml = Object.keys(stats)
        .map(
          (subject) => `
            <b>${subject}:</b>
            ${Object.keys(stats[subject])
    .map(
      (period) => `
              <ul>
                <li>${period}</li>
                <ul>
                  ${stats[subject][period]
    .map(
      (item) => `
                    <li>
                      ${item[0]}:   <b>${item[1]}</b>
                    </li>
                  `
    )
    .join('')}
              </ul>
            </ul>
          `
    )
    .join('')}
        `
        )
        .join(' ')

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

            <div>${statsHtml}</div>
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
