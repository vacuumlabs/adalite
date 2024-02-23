const getHash = require('./getHash')

const cacheResults =
  (maxAge, cacheObj = {}) =>
    (fn) => {
      const wrapped = (...args) => {
        const hash = getHash(JSON.stringify(args))
        if (!cacheObj[hash] || cacheObj[hash].timestamp + maxAge < Date.now()) {
          cacheObj[hash] = {
            timestamp: Date.now(),
            data: fn(...args),
          }
        }
        return cacheObj[hash].data
      }

      return wrapped
    }

module.exports = cacheResults
