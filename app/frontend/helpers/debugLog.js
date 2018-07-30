const CARDANOLITE_CONFIG = require('../config').CARDANOLITE_CONFIG

function debugLog(message) {
  // patched to work with tests, added `CARDANOLITE_CONFIG &&`,
  // because config is loaded from html body, which is not present in tests
  if (CARDANOLITE_CONFIG && CARDANOLITE_CONFIG.CARDANOLITE_ENABLE_DEBUGGING) {
    // eslint-disable-next-line no-console
    console.error(message)
  }
}

module.exports = debugLog
