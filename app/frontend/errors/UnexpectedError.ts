import {BaseError, OptionalParams} from './BaseError'
import {UnexpectedErrorReason} from './unexpectedErrorReason'

export class UnexpectedError extends BaseError {
  constructor(reason: UnexpectedErrorReason, params?: OptionalParams) {
    super(params)
    this.name = reason
  }
}
