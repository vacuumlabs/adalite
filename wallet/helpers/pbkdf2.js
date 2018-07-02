const {pbkdf2, pbkdf2Sync} = require('pbkdf2')

function pbkdf2Async(password, salt, iterations, length, algo) {
  return new Promise((resolveFunction, rejectFunction) => {
    pbkdf2(password, salt, iterations, length, algo, (error, response) => {
      if (error) {
        rejectFunction(error)
      }
      resolveFunction(response)
    })
  })
}

module.exports = {
  pbkdf2Async,
  pbkdf2Sync,
}
