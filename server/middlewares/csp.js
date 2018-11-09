const directives = {
  'default-src': ["'self'"],
  'frame-src': ["'self'", 'https://connect.trezor.io/*', 'https://connect.trezor.io/'],
  'connect-src': ['*'],
  'img-src': ["'self'"],
  'script-src': ["'self'", "'unsafe-inline'"],
  'style-src': ["'self'", "'unsafe-inline'"],
  'object-src': ["'none'"],
}

const csp = Object.entries(directives).map(([key, value]) => `${key} ${value.join(' ')};`)

module.exports = (req, res, next) => {
  res.setHeader('Content-Security-Policy', csp.join(' '))
  next()
}
