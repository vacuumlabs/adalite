import {HARDENED_THRESHOLD} from '../constants'

const indexIsHardened = (index) => index >= HARDENED_THRESHOLD

export default indexIsHardened
