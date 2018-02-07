const cbor = require("cbor");

exports.CBORIndefiniteLengthArray = class CBORIndefiniteLengthArray {
  constructor(elements) {
    this.elements = elements;
  }

  encodeCBOR(encoder) {

    var elementsEncoded = cbor.encode(this.elements);

    elementsEncoded[0] = 0x9f;
    elementsEncoded = Buffer.concat([elementsEncoded, Buffer.from("ff", "hex")]);

    return encoder.push(elementsEncoded);
  }
}