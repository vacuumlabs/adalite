import * as pbkdf2 from 'pbkdf2'
import * as chacha from 'chacha-js'

// TODO: This is what yoroi uses - rewrite with packages we use

const PBKDF_ITERATIONS = 12983
const SALT_SIZE = 16
const KEY_SIZE = 32
const DIGEST = 'sha512'
const NONCE_SIZE = 12
const PROTO_VERSION = Buffer.from('01', 'hex')

/*
	----------------------------------------------------------
	| 0x01 | SALT(16) | NONCE(12) | Encrypted Data | Tag(16) |
	----------------------------------------------------------
*/

const promisifyPbkdf2: (Uint8Array, Buffer) => Promise<Buffer> = (password, salt) => {
  return new Promise((resolve, reject) => {
    // eslint-disable-next-line consistent-return
    pbkdf2.pbkdf2(password, salt, PBKDF_ITERATIONS, KEY_SIZE, DIGEST, (err, key) => {
      if (err) return reject(err)
      resolve(key)
    })
  })
}

// hotfix alternative to crypto-random-string
const cryptoRandomString = ({length}: {length: number}): string => {
  const randBytes = Buffer.alloc(length)
  window.crypto.getRandomValues(randBytes)
  return randBytes.toString('hex')
}

export async function encryptWithPassword(
  passwordBuf: Uint8Array,
  dataBytes: Uint8Array
): Promise<string> {
  const salt = Buffer.from(cryptoRandomString({length: SALT_SIZE}), 'hex')
  const nonce = Buffer.from(cryptoRandomString({length: NONCE_SIZE}), 'hex')
  const data = Buffer.from(dataBytes)
  const aad = Buffer.from('', 'hex')

  const key = await promisifyPbkdf2(passwordBuf, salt)

  const cipher = chacha.createCipher(key, nonce)
  cipher.setAAD(aad, {plaintextLength: data.length})

  const head = cipher.update(data)
  const final = cipher.final()
  const tag = cipher.getAuthTag()

  const cipherText = Buffer.concat([PROTO_VERSION, salt, nonce, head, final, tag])
  return cipherText.toString('hex')
}
