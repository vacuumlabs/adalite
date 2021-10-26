export type OptionalParams = {
  message?: string
  causedBy?: Error
}

export class BaseError extends Error {
  constructor(params: OptionalParams | undefined) {
    super()
    this.message = params?.message || ''
    this.stack = params?.causedBy && `\nError caused by:\n${params.causedBy.stack}`
  }
}
