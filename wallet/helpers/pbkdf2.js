const subtle = global.crypto && global.crypto.subtle
const {Buffer} = require('buffer/')

async function pbkdf2Async(password, salt, iterations, length, algo) {
  password = Buffer.from(password, 'utf-8')
  salt = Buffer.from(salt, 'utf-8')

  return await subtle.importKey(
    'raw', password, {name: 'PBKDF2'}, false, ['deriveBits']
  ).then(async (key) => {
    return new Buffer(
      await subtle.deriveBits({
        name: 'PBKDF2',
        salt,
        iterations,
        hash: {
          name: algo,
        },
      }, key, length << 3)
    )
  })
}

module.exports = {pbkdf2Async}
