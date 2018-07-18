const CardanoCrypto = require('cardano-crypto.js')

const {CARDANO_KEY_DERIVATION_MODE} = require('../constants')

const derivePublic = (xpub, childIndex) =>
  CardanoCrypto.derivePublic(xpub, childIndex, CARDANO_KEY_DERIVATION_MODE)

module.exports = derivePublic
