const request = async function request(url, method = 'GET', body = null, headers = {}) {
  let requestParams = {
    method,
    headers,
  }
  if (method.toUpperCase() !== 'GET') {
    requestParams = Object.assign({}, requestParams, {body})
  }

  try {
    const res = await fetch(url, requestParams)
    if (res.status >= 400) {
      const e = Error(
        `${url} returns error: ${res.status} on payload: ${JSON.stringify(requestParams)}`
      )
      e.name = 'Network error'
      throw e
    }
    return res.json()
  } catch (err) {
    const e = Error(
      `${url} returns ${err.name}:  ${err.message} on payload: ${JSON.stringify(requestParams)}`
    )
    e.name = 'Network error'
    throw e
  }
}

module.exports = request
