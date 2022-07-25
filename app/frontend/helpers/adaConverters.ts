import BigNumber from 'bignumber.js'
import {Lovelace, Ada} from '../types'

const toCoins = (value: Ada): Lovelace =>
  value.times(1000000).integerValue(BigNumber.ROUND_FLOOR) as Lovelace
const toAda = (value: Lovelace): Ada => value.times(0.000001) as Ada

export {toCoins, toAda}
