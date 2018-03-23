module.exports = async function request(url, method = 'GET', body = null, headers = {}) {
  let requestParams = {
    method,
    headers,
  }

  if (method !== 'GET') {
    requestParams = Object.assign({}, requestParams, {body})
  }

  const res = await fetch(url, requestParams)
  if (res.status >= 400) {
    throw new Error(res.status)
  }

  return res.json()
}
