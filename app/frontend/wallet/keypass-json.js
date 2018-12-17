/* based on https://github.com/input-output-hk/cardano-crypto/blob/master/cbits/encrypted_sign.c */

const cbor = require('borc')
const {cardanoMemoryCombine, blake2b, scrypt} = require('cardano-crypto.js')

const {HARDENED_THRESHOLD} = require('./constants')

function transformPassword(password) {
  return password ? blake2b(Buffer.from(password), 32) : Buffer.from([])
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
const [encryptWalletSecret, decryptWalletSecret] = Array(2).fill((walletSecret, password) => {
  const secretKey = walletSecret.slice(0, 64)
  const extendedPublicKey = walletSecret.slice(64, 128)

  return Buffer.concat([cardanoMemoryCombine(secretKey, password), extendedPublicKey])
})

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

  return decryptWalletSecret(walletSecret, password)
}

async function exportWalletSecret(walletSecret, password, walletName) {
  const encryptedWalletSecret = encryptWalletSecret(walletSecret, password)
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
        name: walletName,
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
