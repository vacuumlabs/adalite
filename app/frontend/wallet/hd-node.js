function HdNode({secret, secretKey, publicKey, chainCode}) {
  /**
   * HD node groups secretKey, publicKey and chainCode
   * can be initialized from Buffers or single string
   * @param secretKey as Buffer
   * @param publicKey as Buffer
   * @param chainCode as Buffer
   */

  if (secret) {
    secretKey = secret.slice(0, 64)
    publicKey = secret.slice(64, 96)
    chainCode = secret.slice(96, 128)
  } else {
    secret = Buffer.concat([secretKey, publicKey, chainCode])
  }

  const extendedPublicKey = Buffer.concat([publicKey, chainCode], 64)

  function toBuffer() {
    return Buffer.concat([secretKey, extendedPublicKey])
  }

  function toString() {
    return toBuffer().toString('hex')
  }

  return {
    secretKey,
    publicKey,
    chainCode,
    extendedPublicKey,
    toBuffer,
    toString,
  }
}

module.exports = HdNode
