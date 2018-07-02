const CardanoCrypto = require('rust-cardanolite-crypto')

function derivePublic(xpub, childIndex) {
  return new Buffer(CardanoCrypto.HdWallet.derivePublic(xpub, childIndex))
}

module.exports = derivePublic
