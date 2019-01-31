function NamedError(name, message) {
  const e = new Error(message || name)
  e.name = name
  e.message = message

  return e
}

module.exports = NamedError
