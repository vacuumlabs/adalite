require('dotenv').config()
const cors = require('cors')
const bodyParser = require('body-parser')
const express = require('express')
const compression = require('compression')
const frontendConfig = require('./helpers/loadFrontendConfig')
const app = express()

app.use(bodyParser.json())
app.use(cors())
app.use(compression())

// must be before every other route to guarantee the redirect!
if (process.env.CARDANOLITE_FORCE_HTTPS === 'true') {
  app.use(require('./middlewares/forceHttps'))
}

// don't track in local dev => no need for local redis
if (process.env.REDIS_URL) {
  app.use(require('./middlewares/stats'))
  app.use(require('./middlewares/basicAuth')(['/usage_stats'], {admin: process.env.STATS_PWD}))
  require('./statsPage')(app)
}

app.use(express.static('app/public'))
app.use(express.static('app/dist'))
app.use(express.static('landing_page'))

require('./blockchainExplorerProxy')(app)
require('./transactionSubmitter')(app)

app.get('*', (req, res) => {
  return res.status(200).send(`
  <!doctype html>
  <html>

    <head>
      <title>CardanoLite Wallet</title>
      <meta name="viewport" content="width=device-width, initial-scale=1">
      <script src="js/init.js"></script>
      <link rel="stylesheet" type="text/css" href="css/styles.css">
      <link rel="icon" type="image/ico" href="assets/favicon.ico">
      ${
  process.env.TREZOR_CONNECT_URL
    ? `<script src="${process.env.TREZOR_CONNECT_URL}"></script>`
    : ''
}
      <noscript>Your browser does not support JavaScript or it is turned off.</noscript>
    </head>

    <body data-config='${JSON.stringify(frontendConfig)}'>
      <div id="root" style="width: 100%; height: 100%;"></div>
    </body>

  </html>
`)
})

app.listen(process.env.PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`Cardano wallet app listening on ${process.env.PORT}!`)
})
