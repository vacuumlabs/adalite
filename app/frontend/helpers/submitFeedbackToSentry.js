const request = require('../wallet/helpers/request')

async function sendFeedback(comments, email, name, eventId, token) {
  console.log('sending feedback')
  let response
  const params = {
    event_id: eventId,
    name,
    email,
    comments,
  }
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
    console.log('Feedback submitted!')
  } catch (error) {
    console.error(error)
  } finally {
    console.log(response)
  }
}

module.exports = sendFeedback
