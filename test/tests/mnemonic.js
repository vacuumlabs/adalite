const assert = require('assert')

const {
  generateMnemonic,
  decodePaperWalletMnemonic,
  mnemonicToHashSeed,
} = require('../../wallet/mnemonic')

const paperWalletMnemonic =
  'force usage medal chapter start myself odor ripple concert aspect wink melt afford lounge smart bulk way hazard burden type broken defense city announce reward same tumble'
const standardMnemonic = 'swim average antenna there trap nice good stereo lion safe next brief'
const expectedHashSeed = '5820f56bcbc3cea284f348db4e4e5ce4019fb991d909fee5ca35313229258c7735db'

describe('mnemonic generation', () => {
  const mnemonicString = generateMnemonic()

  it('should produce 12 words', () => {
    assert.equal(mnemonicString.split(' ').length, 12)
  })
})

// eslint-disable-next-line prefer-arrow-callback
describe('paper wallet decoding', function() {
  this.timeout(10000)
  it('should properly decode paper wallet mnemonic', async () => {
    assert.equal(await decodePaperWalletMnemonic(paperWalletMnemonic), standardMnemonic)
  })
})
