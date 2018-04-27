const cbor = require('cbor')
module.exports = class CborIndefiniteLengthArray {
  constructor(elements) {
    this.elements = elements
  }

  encodeCBOR(encoder) {
    return encoder.push(
      Buffer.concat([
        new Buffer([0x9f]), // indefinite array prefix
        ...this.elements.map((e) => cbor.encode(e)),
        new Buffer([0xff]), // end of array
      ])
    )
  }
}
