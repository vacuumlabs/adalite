const {pbkdf2: pbkdf2Async} = require('pbkdf2')

const pbkdf2 = (password, salt, iterations, length, algo) =>
  new Promise((resolveFunction, rejectFunction) => {
    pbkdf2Async(password, salt, iterations, length, algo, (error, response) => {
      if (error) {
        rejectFunction(error)
      }
      resolveFunction(response)
    })
  })

module.exports = pbkdf2
