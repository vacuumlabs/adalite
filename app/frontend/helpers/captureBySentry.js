const {isExpected} = require('./expectedErrors')

function captureBySentry(e) {
  // errorHadler
  if (!isExpected(e)) {
    throw e
  }
  return
}

module.exports = captureBySentry
