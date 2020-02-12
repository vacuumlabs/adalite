function _HdNode({secretKey, publicKey, chainCode}) {
  /**
   * HD node groups secretKey, publicKey and chainCode
   * can be initialized from Buffers or single string
   * @param secretKey as Buffer
   * @param publicKey as Buffer
   * @param chainCode as Buffer
   */

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

function HdNode(secret) {
  const secretKey = secret.slice(0, 64)
  const publicKey = secret.slice(64, 96)
  const chainCode = secret.slice(96, 128)
  return _HdNode({secretKey, publicKey, chainCode})
}

export default HdNode
