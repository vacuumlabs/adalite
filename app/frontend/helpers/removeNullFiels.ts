export const removeNullFields = (obj: any): any =>
  Object.keys(obj)
    .filter((key) => obj[key] !== null && obj[key] !== undefined)
    .reduce((acc, key) => {
      acc[key] = obj[key]
      return acc
    }, {})
