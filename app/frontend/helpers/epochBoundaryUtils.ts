import * as moment from 'moment'
import {InternalError, InternalErrorReason} from '../errors'
import {OptionalParams} from '../errors/BaseError'

export function isEpochBoundaryUnderway(): boolean {
  const epochTransition = moment('15 May 2021 21:44 UTC')
  const now = moment(Date.now())
  const dayDiff = now.diff(epochTransition, 'days')
  const relativeMinuteDiff = now.subtract(dayDiff, 'days').diff(epochTransition, 'minutes')
  // multiple of 5 days passed and it's no more than X minutes since the transition
  if (dayDiff % 5 === 0 && relativeMinuteDiff < 60) {
    return true
  }
  return false
}

export function throwIfEpochBoundary(params?: OptionalParams): void {
  if (isEpochBoundaryUnderway()) {
    throw new InternalError(InternalErrorReason.EpochBoundaryUnderway, params)
  }
}
