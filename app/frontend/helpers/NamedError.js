function NamedError(name, message, showHelp) {
  const e = new Error(message || name || showHelp)
  e.name = name
  e.message = message
  e.showHelp = showHelp
  return e
}

export default NamedError
