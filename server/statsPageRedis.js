const redis = require('redis')
const redisScan = require('redisscan')
const client = redis.createClient(process.env.REDIS_URL)
const {captureException} = require('@sentry/node')

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
      'sentOut:total': [],
      'sentOut:monthly': [],
      'sentOut:daily': [],
      'sentTotal:total': [],
      'sentTotal:monthly': [],
      'sentTotal:daily': [],
      'Ledger:total': [],
      'Ledger:mothly': [],
      'Ledger:daily': [],
      'Trezor:total': [],
      'Trezor:mothly': [],
      'Trezor:daily': [],
      'Mnemonic:total': [],
      'Mnemonic:mothly': [],
      'Mnemonic:daily': [],
    },
    otherTxSubmissions: {
      'successful:total': [],
      'successful:monthly': [],
      'successful:daily': [],
      'unsuccessful:total': [],
      'unsuccessful:monthly': [],
      'unsuccessful:daily': [],
      'sentOut:total': [],
      'sentOut:monthly': [],
      'sentOut:daily': [],
      'sentTotal:total': [],
      'sentTotal:monthly': [],
      'sentTotal:daily': [],
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

    if (stats[subject] && stats[subject][period]) {
      stats[subject][period].push([nameTokens[nameTokens.length - 1], item[1]])
    }
  })

  return stats
}

const isAdaAmountKey = (key) => key.search(/sentOut:|sentTotal:/) !== -1

module.exports = function(app, env) {
  app.get('/usage_stats', async (req, res) => {
    try {
      const stats = await getStats()

      const tableOfContents = Object.keys(stats)
        .map(
          (subject) => `
          <b>${subject}:</b>
          ${Object.keys(stats[subject])
    .map(
      (period) => `
            <ul>
                <a href="#${(subject + period).replace(':', '-')}">${
  isAdaAmountKey(period) ? `${period} (ADA)` : period
}</a>
          </ul>
        `
    )
    .join('')}
      `
        )
        .join(' ')

      const statsHtml = Object.keys(stats)
        .map(
          (subject) => `
            <b>${subject}:</b>
            ${Object.keys(stats[subject])
    .map(
      (period) => `
              <ul>
                <li id=${(subject + period).replace(':', '-')}>
                  ${isAdaAmountKey(period) ? `${period} (ADA)` : period}
                </li>
                
                <table style=";margin-left:36px;">
                  ${stats[subject][period]
    .map((item) => {
      const [key, value] = item
      return `
        
      <tr style="list-style-type:circle;">
          
            <td style="display:list-item;">${key}:   <td>
            <td style="text-align:end;">
              <b>
                ${
  isAdaAmountKey(period)
    ? Math.round(value / 1000000).toLocaleString('en')
    : parseInt(value, 10).toLocaleString('en')
}
    </b>
            </td>
          </tr>
          
        `
    })
    .join('')}
              </table>
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
            <meta charset="utf-8" name="viewport"
                      content="height=device-height, 
                      width=device-width, initial-scale=1.0, 
                      minimum-scale=1.0, maximum-scale=1.0, 
                      user-scalable=no">
            <title>AdaLite Wallet Stats</title>
            <link rel="icon" type="image/ico" href="assets/favicon.ico">
          </head>
          <body>
            Stats of transaction submissions and estimates of unique IPs visits per day, month and in total.
            <a href="#tableOfContents" style="position:fixed;top:93%;left:calc(10% + 250px)">Table</a>
            <div id="tableOfContents">${tableOfContents}</div>
            <div>${statsHtml}</div>
          </body>
        </html>
      `)
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error(e)
      captureException(e)
      return 'Something went wrong, bother the devs.'
    }
  })
}
