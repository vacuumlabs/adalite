export default (quantity: number, decimals: number): string =>
  (quantity / Math.pow(10, decimals)).toFixed(decimals)
