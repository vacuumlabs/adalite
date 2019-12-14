// eslint-disable-next-line no-unused-vars
import {Lovelace} from '../state'
export default (coins: Lovelace): string => (coins * 0.000001).toFixed(6)
