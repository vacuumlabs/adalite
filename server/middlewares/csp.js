const directives = {
  'default-src': ["'self'"],
  'frame-src': [
    '*',
    "'self'",
    'https://connect.trezor.io/*',
    'https://connect.trezor.io/',
    'https://dev.suite.sldev.cz',
    'https://dev.suite.sldev.cz/*',
    'https://widget.changelly.com/',
    'https://www.youtube.com/',
  ],
  // Forbid rendering of our page in <iframe /> in order to prevent clickjacking attack
  // Note, it is not supported by IE, but IE is already officially deprecated
  'frame-ancestors': ["'none'"],
  // advised for backwards compatibility of `frame-ancestors`
  'child-src': ["'none'"],
  'form-action': ['https://formspree.io'],
  // `base-uri` prevents the injection of unauthorized <base /> tags which can be used to redirect
  // all relative URLs (like scripts) to an attacker-controlled domain.
  'base-uri': ["'none'"],
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
  'worker-src': ["'none'"],
}

// upgrade-insecure-requests left out in order to allow BitBox02 to work in Firefox
// through the BitBox bridge app which is a locally hosted app communicating through http

const csp = Object.entries(directives).map(([key, value]) => `${key} ${value.join(' ')};`)

module.exports = (req, res, next) => {
  res.setHeader('Content-Security-Policy', csp.join(' '))
  next()
}
