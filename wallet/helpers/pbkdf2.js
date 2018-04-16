const subtle = global.crypto && global.crypto.subtle
const {Buffer} = require('buffer/')
const {pbkdf2Sync} = require('pbkdf2')

async function pbkdf2Async(password, salt, iterations, length, algo) {
  try {
    const toBufferUtf8 = (str) => Buffer.from(str, 'utf-8')

    return await subtle.importKey(
      'raw', toBufferUtf8(password), {name: 'PBKDF2'}, false, ['deriveBits']
    ).then(async (key) => {
      return new Buffer(
        await subtle.deriveBits({
          name: 'PBKDF2',
          salt: toBufferUtf8(salt),
          iterations,
          hash: {
            name: algo,
          },
        }, key, length << 3)
      )
    })
  } catch (err) {
    /*
    * hotfix for EdgeHTML v16 and earlier
    * see: https://developer.microsoft.com/en-us/microsoft-edge/platform/issues/9259365/
    */
    algo = algo.replace('-', '').toLowerCase()
    return Promise.resolve(pbkdf2Sync(password, salt, iterations, length, algo))
  }
}

module.exports = {pbkdf2Async}
