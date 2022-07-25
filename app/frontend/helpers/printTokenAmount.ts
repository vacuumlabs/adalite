import BigNumber from 'bignumber.js'

export default (quantity: BigNumber, decimals: number): string =>
  quantity.dividedBy(new BigNumber(10).pow(decimals)).toFixed(decimals)
