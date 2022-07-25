import BigNumber from 'bignumber.js'
import {Lovelace} from '../types'
export default (coins: Lovelace, precision = 6): string => {
  const adaAmount = coins.times(0.000001)

  if (precision === 0) {
    return adaAmount.integerValue(BigNumber.ROUND_FLOOR).toString()
  } else if (precision > 0 && precision <= 6) {
    return adaAmount.toFixed(7).slice(0, -7 + precision)
  } else {
    return adaAmount.toFixed(precision)
  }
}
