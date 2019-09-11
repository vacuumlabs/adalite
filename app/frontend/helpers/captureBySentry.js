const {getTranslation} = require('../translations')

function captureBySentry(e) {
  // errorHadler
  if (!getTranslation(e.name)) {
    throw e
  }
  return
}

module.exports = captureBySentry
