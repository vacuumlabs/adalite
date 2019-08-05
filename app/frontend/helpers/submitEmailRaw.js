const {ADALITE_CONFIG} = require('../config')
const request = require('../wallet/helpers/request')

async function submitEmailRaw(email) {
  console.log(email)
  const response = await request(
    `${ADALITE_CONFIG.ADALITE_SERVER_URL}/api/emails/submit`,
    'POST',
    JSON.stringify({email}),
    {
      'Content-Type': 'application/json',
    }
  )

  return response
}

module.exports = submitEmailRaw
