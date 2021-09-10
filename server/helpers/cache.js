const TIMEOUT = 24 * 60 * 60 * 1000 // 1 day
const PRUNE_RATIO = 0.1

class Cache {
  constructor(limit, maxAge = TIMEOUT) {
    this.limit = limit
    this.maxAge = maxAge
    this.cache = new Map()
  }

  has(key) {
    if (this.cache.has(key)) {
      if (this.cache.get(key).timestamp + this.maxAge > Date.now()) {
        return true
      }
      this.cache.delete(key)
    }
    return false
  }

  get(key) {
    if (this.has(key)) {
      return this.cache.get(key).data
    }
    return undefined
  }

  set(key, value) {
    this.cache.set(key, {
      timestamp: Date.now(),
      data: value,
    })
    if (this.cache.size > this.limit) this._prune()
  }

  _prune() {
    const pruneSize = Math.round(PRUNE_RATIO * this.limit)
    // Map preserves the order of insertion
    Array.from(this.cache.keys())
      .slice(0, pruneSize)
      .forEach((key) => this.cache.delete(key))
  }
}

module.exports = Cache
