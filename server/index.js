const cors = require('cors')
const bodyParser = require('body-parser')
const express = require('express')
const app = express()
const bowser = require('bowser')

const config = require('./helpers/backendConfigLoader')

app.use(bodyParser.json())
app.use(cors())
app.use(express.static('public'))

if (config.CARDANOLITE_FORCE_HTTPS === 'true') {
  app.use((req, res, next) => {
    if (!req.secure && req.get('x-forwarded-proto') !== 'https') {
      res.redirect(301, `https://${req.get('host')}${req.url}`)
    } else {
      res.setHeader('Strict-Transport-Security', 'max-age=31536000')
      next()
    }
  })
}

const isBrowserSupported = (userAgent) => {
  const minSupportedVersionsDesktop = {
    chrome: '55',
    chromium: '55',
    firefox: '52',
    safari: '11',
    msedge: '15',
    opera: '42',
    msie: '12',
  }

  const minSupportedVersionsMobile = {
    ios: '11.2',
    chrome: '64',
    android: '62',
    msedge: '15',
    opera: '42',
    firefox: '57',
  }

  const isMobileDevice = bowser.mobile || bowser.tablet
  const isDesktop = isMobileDevice === undefined

  return (
    (isDesktop && bowser.check(minSupportedVersionsDesktop, true, userAgent)) ||
    (isMobileDevice && bowser.check(minSupportedVersionsMobile, true, userAgent))
  )
}

require('./blockchainExplorerProxy')(app)
require('./transactionSubmitter')(app)

app.get('*', (req, res) => {
  if (isBrowserSupported(req.headers['user-agent'])) {
    return res.status(200).send(`
      <!doctype html>
      <html>

        <head>
          <title>CardanoLite Wallet</title>
          <meta name="viewport" content="width=device-width, initial-scale=1">
          <script src="js/frontend.bundle.js" defer></script>
          <link rel="stylesheet" type="text/css" href="css/styles.css">
          <link rel="icon" type="image/ico" href="assets/favicon.ico">
          <noscript>Your browser does not support JavaScript or it is turned off.</noscript>
        </head>

        <body data-config=${JSON.stringify(config)}>
          <div id="root" style="width: 100%; height: 100%;"></div>
        </body>

      </html>
    `)
  } else {
    return res.status(200).send(`
      <!doctype html>
      <html>

        <head>
          <title>CardanoLite Wallet</title>
          <link rel="icon" type="image/ico" href="assets/favicon.ico">
        </head>

        <body>
          Unsupported browser. Please try updating it or install the latest version of a supported one. We recommend trying:
          <ul>
            <li><a href="https://www.google.com/chrome">Google Chrome</a></li>
            <li><a href="https://www.mozilla.org/en-US/firefox">Firefox</a></li>
          </ul>
        </body>

      </html>
    `)
  }
})

app.listen(process.env.PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`Cardano wallet app listening on ${process.env.PORT}!`)
})
