const getHash = require('./getHash')

const cacheResults = (maxAge, cache_obj = {}) => (fn) => {
  const wrapped = (...args) => {
    const hash = getHash(JSON.stringify(args))
    if (!cache_obj[hash] || cache_obj[hash].timestamp + maxAge < Date.now()) {
      cache_obj[hash] = {
        timestamp: Date.now(),
        data: fn(...args),
      }
    }
    return cache_obj[hash].data
  }

  return wrapped
}

module.exports = cacheResults
