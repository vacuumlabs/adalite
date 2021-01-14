// eslint-disable-next-line no-unused-vars
import {Lovelace} from '../state'
export default (coins: Lovelace, decimals = 6): string =>
  (Math.floor(coins * 0.000001 * Math.pow(10, decimals)) / Math.pow(10, decimals)).toFixed(decimals)
