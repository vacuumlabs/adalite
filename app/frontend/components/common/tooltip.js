module.exports = (message, enabled) => {
  return (
    enabled && {
      'data-balloon': message,
    }
  )
}
