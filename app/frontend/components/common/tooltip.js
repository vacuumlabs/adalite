const tooltip = (message, enabled, displayAlways) => {
  return (
    enabled && {
      'data-balloon': message,
      'data-balloon-visible': displayAlways ? 'true' : '',
    }
  )
}

module.exports = tooltip
