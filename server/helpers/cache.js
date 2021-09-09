const TIMEOUT = 24 * 60 * 60 * 1000 // 1 day
const PRUNE_RATIO = 0.1

class Cache {
  constructor(limit, maxAge = TIMEOUT) {
    this.limit = limit
    this.maxAge = maxAge
    this.cache = {}
    this.size = 0
  }

  get(key) {
    if (key in this.cache && this.cache[key].timestamp + this.maxAge > Date.now()) {
      return this.cache[key].data
    }
    return undefined
  }

  set(key, value) {
    if (this.get(key) === undefined) this.size++
    this.cache[key] = {
      timestamp: Date.now(),
      data: value,
    }
    if (this.size > this.limit) this.prune()
  }

  prune() {
    const pruneSize = Math.round(PRUNE_RATIO * this.limit)
    Object.entries(this.cache)
      .sort((a, b) => a[1].timestamp - b[1].timestamp)
      .slice(0, pruneSize)
      .forEach(([key, value]) => delete this.cache[key])
    this.size -= pruneSize
  }
}

module.exports = Cache
