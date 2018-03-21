const env = require('dotenv').config().parsed
const express = require('express')
const app = express()


app.use(express.static('public'))

app.get('/', (req, res) => {
  return res.status(200).send(`
    <!doctype html>
    <html>

      <head>
        <script src="js/frontend.bundle.js" defer></script>
        <link rel="stylesheet" type="text/css" href="css/styles.css">
      </head>

      <body data-config=${JSON.stringify(env)}>
        <div id="root" style="width: 100%; height: 100%;"></div>
      </body>

    </html>
  `)
})

app.listen(process.env.PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`Cardano wallet app listening on ${process.env.PORT}!`)
})
