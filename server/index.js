require('dotenv').config()
const express = require('express')
const app = express()

const PORT = process.env.PORT

app.use(express.static('public'))

app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`Cardano wallet app listening on ${PORT}!`)
})
