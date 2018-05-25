const assert = require('assert')

const {mnemonicToHdNode} = require('../../wallet/hd-node')

describe('hdNode derivation from mnemonic', () => {
  // a test case where the hash seed has an odd number of bytes
  const mnemonicString1 = 'cruise bike bar reopen mimic title style fence race solar million clean'
  const generatedHdNode1 = mnemonicToHdNode(mnemonicString1).toString()
  const expectedHdNode1 =
    'b0d4187b81b5c2fb8234378ebcf33a1c2e2293369bd2263b6dcf672a29676a5a2e73d1f6e660365eacdde77052625f0cc6e50c0710b35e45095fb1b51b9b9315f83d8464268bbb19fe416000fa846eaed7171d4390242aa966ab80c36694b7fa6eec090fd6c6498bb4a28b61f8c4c5ae19b635e20052cb0bc7e0d17404b1717e'
  it('should produce right secret key from a seed which had a leading zero in hex by stripping it', () => {
    assert.equal(generatedHdNode1, expectedHdNode1)
  })

  // a test case where the hash seed has an even number of bytes
  const mnemonicString2 =
    'useful normal dismiss what earn total boost project tomorrow filter pill shuffle'
  const generatedHdNode2 = mnemonicToHdNode(mnemonicString2).toString()
  const expectedHdNode2 =
    '30582ede015798e511207cb26d71ca460edb85a16fafe212261039eeaccd434fab1c009a83260352b8cf80241d097696d898b7a0a0296312227bb459c3784cc12770c30533d63e77ad46c26a47c1d659058ab0c3dcf0e899e40113e7def05dd73fc6f8b25d9d774caebaed348f8e1a7d503c958e0cf74337e95d1d5e4a2d4aa0'
  it('should produce right secret key from a seed without a leading zero in hex', () => {
    assert.equal(generatedHdNode2, expectedHdNode2)
  })
})
