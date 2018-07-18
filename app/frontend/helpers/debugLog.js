const CARDANOLITE_CONFIG = require('../config').CARDANOLITE_CONFIG

function debugLog(message) {
  if (CARDANOLITE_CONFIG.CARDANOLITE_ENABLE_DEBUGGING) {
    // eslint-disable-next-line no-console
    console.error(message)
  }
}

module.exports = debugLog
