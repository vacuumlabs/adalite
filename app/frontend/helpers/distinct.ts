export default <T>(array: T[]) => Array.from(new Set(array)) as T[]
