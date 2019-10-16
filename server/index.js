const bodyParser = require('body-parser')
const express = require('express')
const compression = require('compression')
const fs = require('fs')
const https = require('https')
const {frontendConfig, backendConfig} = require('./helpers/loadConfig')

let app = express()

app.use(bodyParser.json())
app.use(compression())

app.enable('trust proxy') // to get the actual request protocol on heroku (important for redirect)
app.use(require('./middlewares/redirectToBaseUrl'))

// don't track in local dev => no need for local GA
if (backendConfig.ADALITE_GA_TRACKING_ID) {
  app.use(require('./middlewares/statsGoogleAnalytics').trackVisits)
  app.use(require('./middlewares/statsGoogleAnalytics').trackTxSubmissions)
}

// don't track in local dev => no need for local redis
if (backendConfig.REDIS_URL) {
  app.use(require('./middlewares/statsRedis').trackVisits)
  app.use(require('./middlewares/statsRedis').trackTxSubmissions)
  app.use(
    require('./middlewares/basicAuth')(['/usage_stats'], {admin: backendConfig.ADALITE_STATS_PWD})
  )
  require('./statsPageRedis')(app)
}

app.use(express.static('app/public'))
app.use(express.static('app/dist'))

// disable csp when developing trezor firmware to be able to load it
if (!backendConfig.ADALITE_TREZOR_CONNECT_URL) {
  app.use(require('./middlewares/csp'))
}

if (backendConfig.ADALITE_ENABLE_SERVER_MOCKING_MODE === 'true') {
  require('./mocking')(app)
} else {
  require('./transactionSubmitter')(app)
  require('./emailSubmitter')(app)
}

app.get('*', (req, res) => {
  const serverUrl = backendConfig.ADALITE_SERVER_URL
  return res.status(200).send(`
      <!doctype html>
      <html>

        <head>
          <title>AdaLite - Cardano Wallet</title>
          <meta charset="UTF-8"/>
          <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no"/>
          <meta name="robots" content="index,follow">
          <meta name="description" content="Free open-source web-browser Cardano wallet with Trezor and Ledger Nano S and Nano X support. Highly secure and accessible from everywhere.">
          <meta name="keywords" content="Cardano, Ada, Wallet, Cryptocurrency, Adalite, Trezor">

          <meta name="twitter:card" content="summary" />
          <meta name="twitter:site" content="@AdaLiteWallet">
          <meta name="twitter:title" content="AdaLite - Cardano Wallet" />
          <meta name="twitter:description" content="Free open-source web-browser Cardano wallet with Trezor and Ledger Nano S and Nano X support" />
          <meta name="twitter:image" content="${serverUrl}/assets/twitter-card.png" />

          <meta property="og:type" content="website" />
          <meta property="og:site_name" content="AdaLite" />
          <meta property="og:locale" content="en_US" />
          <meta property="og:url" content="${serverUrl}">
          <meta property="og:title" content="AdaLite - Cardano Wallet">
          <meta property="og:description" content="Free open-source web-browser Cardano wallet with Trezor and Ledger Nano S and Nano X support">
          <meta property="og:image" content="${serverUrl}/assets/og-image.png">

          <script src="js/init.js"></script>
          <link rel="stylesheet" type="text/css" href="css/styles.css">
          <link rel="icon" type="image/ico" href="assets/favicon.ico">
          ${
  backendConfig.ADALITE_TREZOR_CONNECT_URL
    ? `<script src="${backendConfig.ADALITE_TREZOR_CONNECT_URL}"></script>`
    : ''
}
          <noscript>
            Your browser does not support JavaScript or it is turned off.<br/>
          </noscript>
        </head>

        <body data-config='${JSON.stringify(frontendConfig)}'>
          <div id="root" style="width: 100%; height: 100%;"></div>
        </body>

      </html>
    `)
})

/*
 * To run server in secure mode, you need to set
 * ADALITE_SERVER_URL to 'https://localhost:3000'.
 * ADALITE_ENABLE_HTTPS is defaultly set to true
 * (in package.json -> scripts -> dev)
 */
const enableHttps = process.env.ADALITE_ENABLE_HTTPS === 'true'
if (enableHttps) {
  const options = {
    cert: fs.readFileSync('server.cert'),
    key: fs.readFileSync('server.key'),
  }
  app = https.createServer(options, app)
}

app.listen(backendConfig.PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`Server is listening on ${enableHttps ? 'secure' : ''} port ${backendConfig.PORT}!`)
})
