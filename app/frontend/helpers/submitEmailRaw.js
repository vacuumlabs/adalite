import {ADALITE_CONFIG} from '../config'

import request from '../wallet/helpers/request'

async function submitEmailRaw(email) {
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

export default submitEmailRaw
