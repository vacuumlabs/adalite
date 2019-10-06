const sleep = require('../helpers/sleep')
const debugLog = require('./debugLog')
const {ADALITE_CONFIG} = require('../config')

async function sendFeedback(comments, email, name, eventId) {
  await sleep(5000) // to ensure the feedback gets send after the error
  if (!comments) return
  const params = {
    event_id: eventId,
    name,
    email,
    comments,
  }
  const url = 'https://sentry.io/api/0/projects/vacuumlabs-sro/adalite-frontend/user-feedback/'
  const token = ADALITE_CONFIG.SENTRY_DSN
  try {
    await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `DSN ${token}`,
      },
      body: JSON.stringify(params),
    })
  } catch (e) {
    debugLog(e)
  }
}

module.exports = sendFeedback
