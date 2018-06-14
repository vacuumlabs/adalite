const assert = require('assert')

const {generateMnemonic} = require('../../wallet/mnemonic')

describe('mnemonic generation', () => {
  const mnemonicString = generateMnemonic()

  it('should produce 12 words', () => {
    assert.equal(mnemonicString.split(' ').length, 12)
  })
})
