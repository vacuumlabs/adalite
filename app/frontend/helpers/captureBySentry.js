const {getTranslation} = require('../translations')

function captureBySentry(e) {
  if (!getTranslation(e.name)) {
    throw e
  }
  return
}

module.exports = captureBySentry
