// eslint-disable-next-line no-unused-vars
import {Lovelace} from '../types'
export default (coins: Lovelace, decimals = 6): string => {
  const adaAmount = coins * 0.000001

  if (decimals === 0) {
    return Math.floor(adaAmount).toString()
  } else if (decimals > 0 && decimals <= 6) {
    return adaAmount.toFixed(7).slice(0, -7 + decimals)
  } else {
    return adaAmount.toFixed(decimals)
  }
}
