const directives = {
  'default-src': ["'self'"],
  'frame-src': [
    "'self'",
    'https://connect.trezor.io/*',
    'https://connect.trezor.io/',
    'https://widget.changelly.com/',
  ],
  'connect-src': ['*'],
  'img-src': ["'self'", 'data:'],
  'script-src': [
    "'self' 'unsafe-eval'",
    /*
     * hash of the inline script used to test browser compatibility
     * you need to update it manually if it changes.
     * Google Chrome displays the proper hash in the console
     * if you try to load the page and the hash does not match.
     */
    "'sha256-hnF01G4lUcBRBGAqTTfng1Jl9ifL4iDk3r3e9AKUsoU='",
    "'unsafe-inline'", // for backwards compatibility; unsafe-inline is ignored if a nonce or a hash is present. (CSP2 and above)
  ],
  'style-src': ["'self'", "'unsafe-inline'"],
  'object-src': ["'none'"],
}

const csp = Object.entries(directives).map(([key, value]) => `${key} ${value.join(' ')};`)

module.exports = (req, res, next) => {
  res.setHeader('Content-Security-Policy', csp.join(' '))
  next()
}
