require('dotenv').config()
const cors = require('cors')
const bodyParser = require('body-parser')
const express = require('express')
const compression = require('compression')
const {frontendConfig, backendConfig} = require('./helpers/loadConfig')
const app = express()

app.use(bodyParser.json())
app.use(cors())
app.use(compression())

app.enable('trust proxy') // to get the actual request protocol on heroku (important for redirect)
app.use(require('./middlewares/redirectToBaseUrl'))

// don't track in local dev => no need for local redis
if (backendConfig.REDIS_URL) {
  app.use(require('./middlewares/stats').trackVisits)
  app.use(require('./middlewares/stats').trackTxSubmissionCount)
  app.use(require('./middlewares/basicAuth')(['/usage_stats'], {admin: backendConfig.STATS_PWD}))
  require('./statsPage')(app)
}

app.use(express.static('app/public'))
app.use(express.static('app/dist'))
app.use('/about', express.static('about'))

// disable csp when developing trezor firmware to be able to load it
if (!backendConfig.TREZOR_CONNECT_URL) {
  app.use(require('./middlewares/csp'))
}

if (backendConfig.ADALITE_ENABLE_SERVER_MOCKING_MODE === 'true') {
  require('./mocking')(app)
} else {
  require('./transactionSubmitter')(app)
}

app.get('*', (req, res) => {
  const serverUrl = backendConfig.ADALITE_SERVER_URL
  return res.status(200).send(`
      <!doctype html>
      <html>
    
        <head>
          <title>AdaLite - Cardano Wallet</title>
          <meta charset="UTF-8"/>
          <meta name="viewport" content="width=device-width, initial-scale=1">
          <meta name="robots" content="index,follow">
          <meta name="description" content="Free open-source web-browser Cardano wallet with Trezor support. Highly secure and accessible from everywhere.">
          <meta name="keywords" content="Cardano, Ada, Wallet, Cryptocurrency, Adalite, Trezor">
          
          <meta name="twitter:site" content="@AdaLiteWallet">
          <meta property="og:title" content="AdaLite - Cardano Wallet">
          <meta property="og:url" content="${serverUrl}">
          <meta property="og:description" content="Free open-source web-browser Cardano wallet with Trezor support">
          <meta property="og:image" content="${serverUrl}/about/images/adalite_logo.svg">
          
          <script src="js/init.js"></script>
          <link rel="stylesheet" type="text/css" href="css/styles.css">
          <link rel="icon" type="image/ico" href="assets/favicon.ico">
          ${
  backendConfig.TREZOR_CONNECT_URL
    ? `<script src="${backendConfig.TREZOR_CONNECT_URL}"></script>`
    : ''
}
          <noscript>
            Your browser does not support JavaScript or it is turned off.<br/>
            <a href="/about">Link to about page</a>
          </noscript>
        </head>
    
        <body data-config='${JSON.stringify(frontendConfig)}'>
          <div id="root" style="width: 100%; height: 100%;"></div>
        </body>
    
      </html>
    `)
})

app.listen(backendConfig.PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`Cardano wallet app listening on ${backendConfig.PORT}!`)
})
