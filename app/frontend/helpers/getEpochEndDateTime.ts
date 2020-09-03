import {EPOCH_212_END} from '../wallet/constants'
import moment = require('moment')

const getEpochEndDateTime = (epoch) =>
  moment(EPOCH_212_END)
    .add((epoch - 212) * 5, 'days')
    .toDate()

export default getEpochEndDateTime
