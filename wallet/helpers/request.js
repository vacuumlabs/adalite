const requestCache = {}
const MAX_AGE = 10000


async function execute(url, method = 'GET', body = null, headers = {}, enableCache = true) {
  if (method === 'GET' && enableCache) {
    return await cachedFetchGet(url, headers).catch((e) => {throw new Error(e)})
  }

  const res = await fetchFromNetwork(url, method, body, headers)
  if (res.status >= 400) {
    throw new Error(res.status)
  }
  return res.json()
}

async function fetchFromNetwork(url, method = 'GET', body = null, headers = {}) {
  let requestParams = {
    method,
    headers,
  }
  if (method !== 'GET') {
    requestParams = Object.assign({}, requestParams, {body})
  }

  try {
    const res = await fetch(url, requestParams)
    if (res.status >= 300) {
      const e = Error(`${url} returns error: ${res.status} on payload: ${JSON.stringify(requestParams)}`)
      e.name = 'Network error'
      throw e
    }
    return res.json()
  } catch (err) {
    const e = Error(`${url} returns ${err.name}:  ${err.message} on payload: ${JSON.stringify(requestParams)}`)
    e.name = 'Network error'
    throw e
  }
}

async function cachedFetchGet(url, headers) {
  const key = JSON.stringify({url, headers})
  if (!requestCache.hasOwnProperty(key) || (Date.now() - requestCache[key].timestamp > MAX_AGE)) {
    requestCache[key] = {timestamp: Date.now(), response: ''}
    requestCache[key].response = await fetchFromNetwork(url, 'GET', null, headers)
  }
  return requestCache[key].response
}

module.exports = {execute}
