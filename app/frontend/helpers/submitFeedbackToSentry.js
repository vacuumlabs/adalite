const request = require('../wallet/helpers/request')

async function sendFeedback(comments, email, name, eventId, token) {
  // const response = await request(
  //   '/api/0/projects/vacuumlabs-sro/adalite-frontend/user-feedback/',
  //   'POST',
  //   {
  //     comments,
  //     email,
  //     event_id: eventId,
  //     name,
  //   },
  //   {
  //     'Host': 'sentry.io',
  //     'Content-Type': 'application/json',
  //     'Authorization': `Bearer ${token}`,
  //   }
  // )
}

module.exports = sendFeedback
