type OptionalParams = {
  message?: string
  errorStack?: string
}

function NamedError(name: string, optionalParams: OptionalParams = {}) {
  const e = new Error(optionalParams.message || name)
  e.name = name
  e.message = optionalParams.message || ''
  e.stack = optionalParams.errorStack || e.stack
  return e
}

export default NamedError
