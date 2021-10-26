const tooltip = (message, enabled, displayAlways?: boolean) => {
  return displayAlways !== undefined
    ? {
      'data-balloon': message,
      'data-balloon-visible': displayAlways ? 'true' : '',
    }
    : enabled && {
      'data-balloon': message,
    }
}

export default tooltip
