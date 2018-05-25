function hdNodeToString(hdNode) {
  return Buffer.concat([hdNode.secretKey, hdNode.extendedPublicKey]).toString('hex')
}

module.exports = {
  hdNodeToString,
}
