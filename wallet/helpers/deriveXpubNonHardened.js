const CardanoRustCrypto = require('rust-cardanolite-crypto')

function deriveXpubNonHardened(xpub, childIndex) {
  return new Buffer(CardanoRustCrypto.HdWallet.derivePublic(xpub, childIndex))
}

module.exports = deriveXpubNonHardened
