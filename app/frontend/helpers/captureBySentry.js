const {getTranslation} = require('../translations')

function captureBySentry(e) {
  if (e && !getTranslation(e.name)) {
    throw e
  }
  return
}

module.exports = captureBySentry
