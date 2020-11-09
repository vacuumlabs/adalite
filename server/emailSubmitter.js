require('isomorphic-fetch')
const {backendConfig} = require('./helpers/loadConfig')
const {captureException} = require('@sentry/node')

module.exports = function(app, env) {
  app.post('/api/emails/submit', async (req, res) => {
    const listId = backendConfig.ADALITE_MAILCHIMP_LIST_ID // move to config
    const APIKey = backendConfig.ADALITE_MAILCHIMP_API_KEY
    const dataCenter = APIKey.slice(-3) // move to config

    let email
    try {
      email = req.body.email
      if (!email) throw new Error('bad format')
    } catch (err) {
      return res.json({
        Left: 'Bad request body',
      })
    }

    try {
      const response = await fetch(
        `https://${dataCenter}.api.mailchimp.com/3.0/lists/${listId}/members/`,
        {
          method: 'POST',
          body: JSON.stringify({
            email_address: email,
            status: 'subscribed',
          }),
          headers: {
            'Content-Type': 'application/json; charset=utf-8',
            'Authorization': `Basic ${Buffer.from(`anystring:${APIKey}`).toString('base64')}`,
          },
        }
      )

      if (response.status === 200) {
        return res.json({
          Right: 'Successfuly subscribed',
        })
      }

      if (response.status === 400) {
        return res.json({
          Left: 'Email already subscribed or invalid',
        })
      }

      return res.json({
        Left: 'Email submission rejected by network',
      })
    } catch (err) {
      captureException(err)
      return res.json({
        Left: 'An unexpected error has occurred.',
      })
    }
  })
}
