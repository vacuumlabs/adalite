const sleep = require('../helpers/sleep')
const debugLog = require('./debugLog')

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
  const token = 'https://d77d3bf9d9364597badab9c00fa59a31@sentry.io/1501383'
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
