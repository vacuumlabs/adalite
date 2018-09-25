const ADALITE_CONFIG = require('../config').ADALITE_CONFIG

function debugLog(message) {
  // patched to work with tests, added `ADALITE_CONFIG &&`,
  // because config is loaded from html body, which is not present in tests
  if (ADALITE_CONFIG && ADALITE_CONFIG.ADALITE_ENABLE_DEBUGGING) {
    // eslint-disable-next-line no-console
    console.error(message)
  }
}

module.exports = debugLog
