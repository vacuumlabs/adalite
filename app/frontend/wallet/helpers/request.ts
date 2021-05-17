import {InternalError, InternalErrorReason} from '../../errors'
import {throwIfEpochBoundary} from '../../helpers/epochBoundaryUtils'
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
    throw new InternalError(InternalErrorReason.NetworkError, {
      message: `${method} ${url} has failed with the following error: ${e}`,
    })
  })
  if (!response) {
    throw new InternalError(InternalErrorReason.NetworkError, {
      message: `No response from ${method} ${url}`,
    })
  }

  if (response.status === 429) {
    await sleep(DELAY_AFTER_TOO_MANY_REQUESTS)
    return request(url, method, body, headers)
  } else if (response.status >= 500) {
    const errorParams = {
      message: `${method} ${url} returns error: ${response.status} on payload: ${JSON.stringify(
        requestParams
      )}`,
    }
    throwIfEpochBoundary(errorParams)
    throw new InternalError(InternalErrorReason.ServerError, errorParams)
  } else if (response.status >= 400) {
    throw new InternalError(InternalErrorReason.NetworkError, {
      message: `${method} ${url} returns error: ${response.status} on payload: ${JSON.stringify(
        requestParams
      )}`,
    })
  }
  return response.json()
}

export default request
