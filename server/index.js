const cors = require('cors')
const bodyParser = require('body-parser')
const express = require('express')
const statsMiddleware = require('./middleware/stats')
const forceHttpsMiddleware = require('./middleware/forceHttps')
const config = require('./helpers/backendConfigLoader')
const app = express()

app.use(bodyParser.json())
app.use(cors())

// must be before every other route to guarantee the redirect!
if (config.CARDANOLITE_FORCE_HTTPS === 'true') {
  app.use(forceHttpsMiddleware)
}
app.use(statsMiddleware)

app.use(express.static('public_wallet_app'))
app.use(express.static('public_landing_page'))

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
      <noscript>Your browser does not support JavaScript or it is turned off.</noscript>
    </head>

    <body data-config=${JSON.stringify(config)}>
      <div id="root" style="width: 100%; height: 100%;"></div>
    </body>

  </html>
`)
})

app.listen(process.env.PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`Cardano wallet app listening on ${process.env.PORT}!`)
})
