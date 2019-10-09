const {isExpected} = require('./expectedErrors')
const Sentry = require('@sentry/browser')

function captureBySentry(e) {
  if (!isExpected(e)) {
    Sentry.captureException(e)
    return true
  }
  return false
}

module.exports = captureBySentry
