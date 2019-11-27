import {encode} from 'borc'
export default class CborIndefiniteLengthArray {
  constructor(elements) {
    this.elements = elements
  }

  encodeCBOR(encoder) {
    return encoder.push(
      Buffer.concat([
        Buffer.from([0x9f]), // indefinite array prefix
        ...this.elements.map((e) => encode(e)),
        Buffer.from([0xff]), // end of array
      ])
    )
  }
}
