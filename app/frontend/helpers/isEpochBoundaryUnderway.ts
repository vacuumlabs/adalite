import * as moment from 'moment'
import {EPOCH_TRANSITION_MAX_MINUTES} from '../constants'

function isEpochBoundaryUnderway(): boolean {
  const epochTransition = moment('15 May 2021 21:44 UTC')
  const now = moment(Date.now())
  const dayDiff = now.diff(epochTransition, 'days')
  const relativeMinuteDiff = now.subtract(dayDiff, 'days').diff(epochTransition, 'minutes')
  // multiple of 5 days passed and it's no more than X minutes since the transition
  if (dayDiff % 5 === 0 && relativeMinuteDiff < EPOCH_TRANSITION_MAX_MINUTES) {
    return true
  }
  return false
}

export default isEpochBoundaryUnderway
