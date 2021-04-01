import {InternalErrorReason} from './internalErrorReason'
import {BaseError, OptionalParams} from './BaseError'

export class InternalError extends BaseError {
  constructor(reason: InternalErrorReason, params?: OptionalParams) {
    super(params)
    this.name = reason
  }
}
