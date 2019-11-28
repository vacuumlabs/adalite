import sleep from '../helpers/sleep'
import debugLog from './debugLog'
import {ADALITE_CONFIG} from '../config'
import {SENTRY_USER_FEEDBACK_API} from '../wallet/constants'

async function sendFeedback(comments, email, name, eventId) {
  await sleep(5000) // to ensure the feedback gets send after the error
  if (!comments) return
  const params = {
    event_id: eventId,
    name,
    email,
    comments,
  }
  const url = SENTRY_USER_FEEDBACK_API
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

export default sendFeedback
