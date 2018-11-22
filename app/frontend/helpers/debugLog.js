const ADALITE_CONFIG = require('../config').ADALITE_CONFIG

function debugLog(item) {
  // patched to work with tests, added `ADALITE_CONFIG &&`,
  // because config is loaded from html body, which is not present in tests
  if (ADALITE_CONFIG && ADALITE_CONFIG.ADALITE_ENABLE_DEBUGGING) {
    let msgToLog = ''
    if (item instanceof Error) {
      msgToLog = JSON.stringify(item, Object.getOwnPropertyNames(item))
    } else {
      msgToLog = item
    }
    // eslint-disable-next-line no-console
    console.error(msgToLog)
  }
}

module.exports = debugLog
