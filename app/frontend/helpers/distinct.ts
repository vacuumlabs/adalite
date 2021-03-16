const distinct = <T>(array: T[]) => Array.from(new Set(array)) as T[]
export default distinct
