type OptionalParams = {
  message?: string
  causedBy?: Error
}

function NamedError(name: string, optionalParams: OptionalParams = {}) {
  const e = new Error(optionalParams.message || name)
  e.name = name
  e.message = optionalParams.message || ''
  e.stack = optionalParams.causedBy
    ? `\nError caused by:\n${optionalParams.causedBy.stack}`
    : e.stack
  return e
}

export default NamedError
