const CardanoRustCrypto = require('rust-cardanolite-crypto')

function derivePublic(xpub, childIndex) {
  return new Buffer(CardanoRustCrypto.HdWallet.derivePublic(xpub, childIndex))
}

module.exports = deriveXpubNonhardened
