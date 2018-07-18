const assert = require('assert')
const cbor = require('cbor')

const CborIndefiniteLengthArray = require('../../frontend/wallet/helpers/CborIndefiniteLengthArray')

describe('CBOR encoding of indefinite length arrays', () => {
  it('should properly encode empty array', () => {
    const arr = new CborIndefiniteLengthArray([])
    assert.equal(cbor.encode(arr).toString('hex'), '9fff')
  })

  it('should properly encode short array', () => {
    const arr = new CborIndefiniteLengthArray([1, 2, 3])
    assert.equal(cbor.encode(arr).toString('hex'), '9f010203ff')
  })

  it('should properly encode long array', () => {
    const arr = new CborIndefiniteLengthArray([...Array(35).keys()])
    assert.equal(
      cbor.encode(arr).toString('hex'),
      '9f000102030405060708090a0b0c0d0e0f101112131415161718181819181a181b181c181d181e181f182018211822ff'
    )
  })
})
