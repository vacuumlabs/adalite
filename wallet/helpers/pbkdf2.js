const {pbkdf2} = require('pbkdf2')


async function pbkdf2Async(password, salt, iterations, length, algo) {
  return await (new Promise((resolveFunction, rejectFunction) => {
    pbkdf2(password, salt, iterations, length, algo, (error, response) => {
      if (error) {rejectFunction(error)}
      resolveFunction(response)
    })
  }))
}

module.exports = {pbkdf2Async}
