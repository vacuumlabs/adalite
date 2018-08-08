function NamedError(name, message) {
  const e = new Error(message || name)
  e.name = name

  return e
}

module.exports = NamedError
