/* based on https://github.com/input-output-hk/cardano-crypto/blob/master/cbits/encrypted_sign.c */

const scrypt = require('scrypt-async')
const cbor = require('cbor')
const chacha20 = require('@stablelib/chacha')

const {pbkdf2Async} = require('./helpers/pbkdf2')
const hashBlake2b256 = require('./helpers/hashBlake2b256')
const {HARDENED_THRESHOLD} = require('./constants')

function transformPassword(password) {
  return password ? hashBlake2b256(password, null, 32) : Buffer.from([])
}

async function verifyPassword(passwordToVerify, passwordHash) {
  const passwordHashSplit = cbor
    .decode(passwordHash)
    .toString('ascii')
    .split('|')

  const n = 1 << parseInt(passwordHashSplit[0], 10)
  const r = parseInt(passwordHashSplit[1], 10)
  const p = parseInt(passwordHashSplit[2], 10)
  const salt = Buffer.from(passwordHashSplit[3], 'base64')
  const expectedHash = Buffer.from(passwordHashSplit[4], 'base64')

  const passwordToVerifyHash = await new Promise((resolve, reject) => {
    scrypt(
      cbor.encode(transformPassword(passwordToVerify)),
      salt,
      {
        N: n,
        r,
        p,
        dkLen: expectedHash.length,
        encoding: 'base64',
        interruptStep: 1000,
      },
      (hash) => resolve(hash)
    )
  })

  return passwordToVerifyHash === expectedHash.toString('base64')
}

function getRandomSaltForPasswordHash() {
  const randBytes = Buffer.alloc(32)
  window.crypto.getRandomValues(randBytes)

  return cbor.encode(randBytes)
}

async function hashPasswordAndPack(password, salt) {
  const [n, r, p, hashLen] = [14, 8, 1, 32]
  const hash = await new Promise((resolve, reject) => {
    scrypt(
      cbor.encode(transformPassword(password)),
      salt,
      {
        N: 1 << n,
        r,
        p,
        dkLen: hashLen,
        encoding: 'base64',
        interruptStep: 1000,
      },
      (hash) => resolve(hash)
    )
  })

  return [n.toString(), r.toString(), p.toString(), salt.toString('base64'), hash].join('|')
}

// wallet secret encryption/decryption is self-inverse
const [encryptWalletSecret, decryptWalletSecret] = Array(2).fill(async (walletSecret, password) => {
  const secretKey = walletSecret.slice(0, 64)
  const extendedPublicKey = walletSecret.slice(64, 128)

  return Buffer.concat([await memoryCombine(secretKey, password), extendedPublicKey])
})

async function memoryCombine(input, password) {
  if (!password) {
    return input
  }

  const stretched = await pbkdf2Async(
    transformPassword(password),
    Buffer.concat([Buffer.from('encrypted wallet salt', 'ascii'), Buffer.from([0])]),
    15000,
    40,
    'sha512'
  )

  const chacha20Key = stretched.slice(0, 32)
  const chacha20Nonce = stretched.slice(32, 40)

  const output = Buffer.alloc(input.length)
  chacha20.streamXOR(chacha20Key, chacha20Nonce, input, output)

  return output
}

function parseWalletExportObj(walletExportObj) {
  if (walletExportObj.fileType !== 'WALLETS_EXPORT') {
    throw Error('Invalid file type')
  }
  if (walletExportObj.fileVersion !== '1.0.0') {
    throw Error('Invalid file version')
  }

  const {passwordHash: b64PasswordHash, walletSecretKey: b64WalletSecret} = walletExportObj.wallet
  const passwordHash = Buffer.from(b64PasswordHash, 'base64')
  const walletSecret = cbor.decode(Buffer.from(b64WalletSecret, 'base64'))

  return {
    passwordHash,
    walletSecret,
  }
}

async function isWalletExportEncrypted(walletExportObj) {
  const {passwordHash} = parseWalletExportObj(walletExportObj)

  const isPasswordVerified = await verifyPassword('', passwordHash)
  return !isPasswordVerified
}

async function importWalletSecret(walletExportObj, password) {
  const {passwordHash, walletSecret} = parseWalletExportObj(walletExportObj)

  const isPasswordVerified = await verifyPassword(password, passwordHash)
  if (!isPasswordVerified) {
    throw Error('Wrong password')
  }

  if (!password) {
    return walletSecret
  }

  return await decryptWalletSecret(walletSecret, password)
}

async function exportWalletSecret(walletSecret, password) {
  const encryptedWalletSecret = await encryptWalletSecret(walletSecret, password)
  const packedPasswordHash = await hashPasswordAndPack(password, getRandomSaltForPasswordHash())

  return {
    wallet: {
      accounts: [
        {
          name: 'Initial account',
          index: HARDENED_THRESHOLD,
        },
      ],
      walletSecretKey: cbor.encode(encryptedWalletSecret).toString('base64'),
      walletMeta: {
        name: 'cardanolite wallet',
        assurance: 'normal',
        unit: 'ADA',
      },
      passwordHash: cbor.encode(Buffer.from(packedPasswordHash, 'ascii')).toString('base64'),
    },
    fileType: 'WALLETS_EXPORT',
    fileVersion: '1.0.0',
  }
}

module.exports = {
  importWalletSecret,
  exportWalletSecret,
  isWalletExportEncrypted,
}
