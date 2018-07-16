const cbor = require('cbor')
const base58 = require('cardano-crypto.js').base58

const isValidAddress = (address) => {
  try {
    // we decode the address from the base58 string
    // and then we strip the 24 CBOR data taga (the "[0].value" part)
    const addressAsBuffer = cbor.decode(base58.decode(address))[0].value
    const addressData = cbor.decode(addressAsBuffer)
    const addressAttributes = addressData[1]
    cbor.decode(addressAttributes.get(1))
  } catch (e) {
    return false
  }
  return true
}

module.exports = isValidAddress
