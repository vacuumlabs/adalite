import getHash from './getHash'

type Cache<T> = {
  fn: T
  invalidate: () => void
}

const cacheResults = (maxAge: number) => <T extends Function>(fn: T): Cache<T> => {
  let cacheObj = {}

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

  const invalidate = () => {
    cacheObj = {}
  }

  return {
    fn: (wrapped as any) as T,
    invalidate,
  }
}

export default cacheResults
