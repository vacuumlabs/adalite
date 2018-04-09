const cors = require('cors')
const bodyParser = require('body-parser')
const express = require('express')
const app = express()

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

app.get('*', (req, res) => {
  return res.status(200).send(`
    <!doctype html>
    <html>

      <head>
        <title>CardanoLite Wallet</title>
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <script src="js/frontend.bundle.js" defer></script>
        <link rel="stylesheet" type="text/css" href="css/styles.css">
        <link rel="icon" type="image/ico" href="assets/favicon.ico">
      </head>

      <body data-config=${JSON.stringify(config)}>
        <div id="root" style="width: 100%; height: 100%;"></div>
      </body>

    </html>
  `)
})

require('./blockchainExplorerProxy')(app)
require('./transactionSubmitter')(app)

app.listen(process.env.PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`Cardano wallet app listening on ${process.env.PORT}!`)
})
