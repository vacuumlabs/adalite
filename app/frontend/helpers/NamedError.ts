function NamedError(name, message = '', showHelp = '') {
  const e = new Error(message || name || showHelp)
  e.name = name
  e.message = message
  ;(e as any).showHelp = showHelp
  return e
}

export default NamedError
