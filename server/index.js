require('dotenv').config()
const cors = require('cors')
const bodyParser = require('body-parser')
const express = require('express')
const compression = require('compression')
const frontendConfig = require('./helpers/loadFrontendConfig')
const fs = require('fs')
const https = require('https')
const app = express()

const options = {
  cert: fs.readFileSync('server.cert'),
  key: fs.readFileSync('server.key'),
}

app.use(bodyParser.json())
app.use(cors())
app.use(compression())

app.enable('trust proxy') // to get the actual request protocol on heroku (important for redirect)
app.use(require('./middlewares/redirectToBaseUrl'))

// don't track in local dev => no need for local redis
if (process.env.REDIS_URL) {
  app.use(require('./middlewares/stats').trackVisits)
  app.use(require('./middlewares/stats').trackTxSubmissionCount)
  app.use(require('./middlewares/basicAuth')(['/usage_stats'], {admin: process.env.STATS_PWD}))
  require('./statsPage')(app)
}

app.use(express.static('app/public'))
app.use(express.static('app/dist'))
app.use('/about', express.static('about'))
app.use(require('./middlewares/csp'))

if (process.env.ADALITE_ENABLE_SERVER_MOCKING_MODE === 'true') {
  require('./mocking')(app)
} else {
  require('./transactionSubmitter')(app)
}

app.get('*', (req, res) => {
  const serverUrl = process.env.ADALITE_SERVER_URL
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

/*******************************************************************************
 To run server in secure mode, you need to set ADALITE_ENABLE_HTTPS to true and
 ADALITE_SERVER_URL to 'https://localhost:3000'
********************************************************************************/
if (process.env.ADALITE_ENABLE_HTTPS === 'true') {
  https.createServer(options, app).listen(process.env.PORT, () => {
    // eslint-disable-next-line no-console
    console.log(`Cardano wallet app listening on secure port ${process.env.PORT}!`)
  })
} else {
  app.listen(process.env.PORT, () => {
    // eslint-disable-next-line no-console
    console.log(`Cardano wallet app listening on ${process.env.PORT}!`)
  })
}
