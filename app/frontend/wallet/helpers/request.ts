import NamedError from '../../helpers/NamedError'
import sleep from '../../helpers/sleep'
import {DELAY_AFTER_TOO_MANY_REQUESTS} from '../constants'

const request = async function request(url, method = 'GET', body = null, headers = {}) {
  let requestParams = {
    method,
    headers,
    credentials: 'include' as RequestCredentials,
    // mode: 'no-cors',
  }
  if (method.toUpperCase() !== 'GET') {
    requestParams = Object.assign({}, requestParams, {body})
  }
  const response = await fetch(url, requestParams).catch((e) => {
    throw NamedError('NetworkError', `${method} ${url} has failed with the following error: ${e}`)
  })
  if (!response) throw NamedError('NetworkError', `No response from ${method} ${url}`)

  if (response.status === 429) {
    await sleep(DELAY_AFTER_TOO_MANY_REQUESTS)
    return request(url, method, body, headers)
  } else if (response.status >= 500) {
    throw NamedError(
      'ServerError',
      `${method} ${url} returns error: ${response.status} on payload: ${JSON.stringify(
        requestParams
      )}`
    )
  } else if (response.status >= 400) {
    throw NamedError(
      'NetworkError',
      `${method} ${url} returns error: ${response.status} on payload: ${JSON.stringify(
        requestParams
      )}`
    )
  }
  return response.json()
}

export default request
