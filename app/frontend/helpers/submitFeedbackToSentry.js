const request = require('../wallet/helpers/request')

async function sendFeedback() {
  const response = await request(
    '',
    'POST',
    {
      comments: 'It broke!',
      email: 'jane@example.com',
      event_id: '14bad9a2e3774046977a21440ddb39b2',
      name: 'Jane Smith',
    },
    {
      'Content-Type': 'application/json',
      //   ...(token ? {token} : {}),
    }
  )
}
