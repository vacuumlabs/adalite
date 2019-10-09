const NamedError = require('../../helpers/NamedError')
const debugLog = require('../../helpers/debugLog')
const sleep = require('../../helpers/sleep')
const {DELAY_AFTER_TOO_MANY_REQUESTS} = require('../constants')

const request = async function request(url, method = 'GET', body = null, headers = {}) {
  let requestParams = {
    method,
    headers,
    credentials: 'include',
  }
  if (method.toUpperCase() !== 'GET') {
    requestParams = Object.assign({}, requestParams, {body})
  }

  try {
    const response = await fetch(url, requestParams)
    if (response.status === 429) {
      await sleep(DELAY_AFTER_TOO_MANY_REQUESTS)
      return await request(url, method, body, headers)
    } else if (response.status >= 400) {
      throw NamedError(
        'NetworkError',
        `${url} returns error: ${response.status} on payload: ${JSON.stringify(requestParams)}`
        //true
      )
    }
    return response.json()
  } catch (e) {
    debugLog(e)
    throw NamedError('RequestError', `${method} ${url} returns error: ${e}`)
  }
}

module.exports = request
