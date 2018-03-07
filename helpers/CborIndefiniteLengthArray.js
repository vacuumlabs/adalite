const cbor = require('cbor')
module.exports = class CborIndefiniteLengthArray {
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

exports.filter = async function(arr, callback) {
  return (await Promise.all(
    arr.map(async (item) => {
      return (await callback(item)) ? item : undefined
    })
  )).filter((i) => i !== undefined)
}
