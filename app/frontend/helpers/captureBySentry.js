const {getTranslation} = require('../translations')

function captureBySentry(e) {
  if (!getTranslation(e)) {
    throw e
  }
  return
}

module.exports = captureBySentry
