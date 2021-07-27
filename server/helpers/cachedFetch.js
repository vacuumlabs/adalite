const cache = require('memory-cache')

module.exports = async (keyPrefix, url, timeout) => {
  const key = `${keyPrefix}${url}`
  const cachedResponse = cache.get(key)
  if (cachedResponse) {
    return cachedResponse
  } else {
    const response = await fetch(url)
    if (response.status === 200) {
      const json = response.json()
      cache.put(key, json, timeout)
      return json
    } else {
      return null
    }
  }
}
