const cbor = require('cbor')

// rename to CborIndefiniteLengthArray. Use such naming convention throughout the project - treat
// acronyms such as CBOR, JAVA, DB, etc such as single words and capitalize only first letter (or
// don't capitablize at all)
//
// see remarks in ./utils.js
exports.CBORIndefiniteLengthArray = class CBORIndefiniteLengthArray {
  constructor(elements) {
    this.elements = elements
  }

  encodeCBOR(encoder) {
    let elementsEncoded = cbor.encode(this.elements)

    elementsEncoded[0] = 0x9f
    elementsEncoded = Buffer.concat([elementsEncoded, Buffer.from('ff', 'hex')])

    return encoder.push(elementsEncoded)
  }
}
