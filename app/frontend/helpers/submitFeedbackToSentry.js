const request = require('../wallet/helpers/request')

async function sendFeedback(comments, email, name, eventId, token) {
  if (!comments) return
  const params = {
    event_id: eventId,
    name: name || 'no_name',
    email: email || 'no_email',
    comments,
  }
  let response
  console.log(params)
  console.log(JSON.stringify(params))
  const url = 'https://sentry.io/api/0/projects/vacuumlabs-sro/adalite-frontend/user-feedback/'
  try {
    response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `DSN ${token}`,
      },
      body: JSON.stringify(params),
    })
  } catch (e) {
    console.error(e)
  } finally {
    console.log(response)
  }
}

module.exports = sendFeedback
