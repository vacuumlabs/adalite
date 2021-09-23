import assert from 'assert'
import {orderTokenBundle} from '../../frontend/wallet/helpers/tokenFormater'
import {encodeAssetFingerprint} from '../../frontend/wallet/shelley/helpers/addresses'
import {computeMinUTxOLovelaceAmount} from '../../frontend/wallet/shelley/transaction'

describe('Token sorting', () => {
  it('should sort tokenBundle by policyId canonically', () => {
    const tokenBundle = [
      {policyId: 'aaa', assetName: 'xxx', quantity: 1},
      {policyId: 'bb', assetName: 'xxx', quantity: 1},
      {policyId: 'c', assetName: 'xxx', quantity: 1},
      {policyId: 'aa', assetName: 'xxx', quantity: 1},
    ]
    const sortedTokenBundle = [
      {policyId: 'c', assets: [{assetName: 'xxx', quantity: 1}]},
      {policyId: 'aa', assets: [{assetName: 'xxx', quantity: 1}]},
      {policyId: 'bb', assets: [{assetName: 'xxx', quantity: 1}]},
      {policyId: 'aaa', assets: [{assetName: 'xxx', quantity: 1}]},
    ]
    assert.deepEqual(sortedTokenBundle, orderTokenBundle(tokenBundle))
  })

  it('should sort assets in tokenBundle canonically', () => {
    const tokenBundle = [
      {policyId: 'a', assetName: 'xxx', quantity: 1},
      {policyId: 'a', assetName: 'yy', quantity: 1},
      {policyId: 'a', assetName: 'z', quantity: 1},
      {policyId: 'a', assetName: 'xx', quantity: 1},
    ]
    const sortedTokenBundle = [
      {
        policyId: 'a',
        assets: [
          {assetName: 'z', quantity: 1},
          {assetName: 'xx', quantity: 1},
          {assetName: 'yy', quantity: 1},
          {assetName: 'xxx', quantity: 1},
        ],
      },
    ]
    assert.deepEqual(sortedTokenBundle, orderTokenBundle(tokenBundle))
  })

  it('should sort tokenBundle canonically', () => {
    const tokenBundle = [
      {policyId: 'bb', assetName: 'z', quantity: 1},
      {policyId: 'c', assetName: 'x', quantity: 1},
      {policyId: 'aaa', assetName: 'xx', quantity: 1},
      {policyId: 'aa', assetName: 'x', quantity: 1},
      {policyId: 'aaa', assetName: 'z', quantity: 1},
      {policyId: 'aaa', assetName: 'yy', quantity: 1},
      {policyId: 'aa', assetName: 'y', quantity: 1},
    ]

    const sortedTokenBundle = [
      {
        policyId: 'c',
        assets: [{assetName: 'x', quantity: 1}],
      },
      {
        policyId: 'aa',
        assets: [
          {assetName: 'x', quantity: 1},
          {assetName: 'y', quantity: 1},
        ],
      },
      {
        policyId: 'bb',
        assets: [{assetName: 'z', quantity: 1}],
      },
      {
        policyId: 'aaa',
        assets: [
          {assetName: 'z', quantity: 1},
          {assetName: 'xx', quantity: 1},
          {assetName: 'yy', quantity: 1},
        ],
      },
    ]
    assert.deepEqual(sortedTokenBundle, orderTokenBundle(tokenBundle))
  })
})

describe('Min ada calculation', () => {
  it('should calculate min ADA value for empty tokens', () => {
    assert.deepEqual(1000000, computeMinUTxOLovelaceAmount([]))
  })
  it('should calculate min ADA value for multiple assets under one policy', () => {
    const tokenBundle = [
      {
        policyId: 'ca37dd6b151b6a1d023ecbd22d7e881d814b0c58a3a3148b42b865a0',
        assetName: '000000000000',
        quantity: 1,
      },
      {
        policyId: 'ca37dd6b151b6a1d023ecbd22d7e881d814b0c58a3a3148b42b865a0',
        assetName: '',
        quantity: 1,
      },
    ]
    assert.deepEqual(1518517, computeMinUTxOLovelaceAmount(tokenBundle))
  })
  it('should calculate min ADA value for multiple assets under multiple policies', () => {
    const tokenBundle = [
      {
        policyId: 'ca37dd6b151b6a1d023ecbd22d7e881d814b0c58a3a3148b42b865a0',
        assetName: '000000000000',
        quantity: 1,
      },
      {
        policyId: '6b8d07d69639e9413dd637a1a815a7323c69c86abbafb66dbfdb1aa7',
        assetName: '111111111111',
        quantity: 1,
      },
    ]
    assert.deepEqual(1666665, computeMinUTxOLovelaceAmount(tokenBundle))
  })
  it('should calculate min ADA value for multiple assets under multiple policies with same assetName', () => {
    const tokenBundle = [
      {
        policyId: 'ca37dd6b151b6a1d023ecbd22d7e881d814b0c58a3a3148b42b865a0',
        assetName: '000000000000',
        quantity: 1,
      },
      {
        policyId: '6b8d07d69639e9413dd637a1a815a7323c69c86abbafb66dbfdb1aa7',
        assetName: '000000000000',
        quantity: 1,
      },
    ]
    assert.deepEqual(1666665, computeMinUTxOLovelaceAmount(tokenBundle))
  })
})

// test vectors from https://github.com/cardano-foundation/CIPs/pull/64
const assetFingerprintTestVectors = [
  {
    policyid: '7eae28af2208be856f7a119668ae52a49b73725e326dc16579dcc373',
    assetname: '',
    assetfingerprint: 'asset1rjklcrnsdzqp65wjgrg55sy9723kw09mlgvlc3',
  },
  {
    policyid: '7eae28af2208be856f7a119668ae52a49b73725e326dc16579dcc37e',
    assetname: '',
    assetfingerprint: 'asset1nl0puwxmhas8fawxp8nx4e2q3wekg969n2auw3',
  },
  {
    policyid: '1e349c9bdea19fd6c147626a5260bc44b71635f398b67c59881df209',
    assetname: '',
    assetfingerprint: 'asset1uyuxku60yqe57nusqzjx38aan3f2wq6s93f6ea',
  },
  {
    policyid: '7eae28af2208be856f7a119668ae52a49b73725e326dc16579dcc373',
    assetname: '504154415445',
    assetfingerprint: 'asset13n25uv0yaf5kus35fm2k86cqy60z58d9xmde92',
  },
  {
    policyid: '1e349c9bdea19fd6c147626a5260bc44b71635f398b67c59881df209',
    assetname: '504154415445',
    assetfingerprint: 'asset1hv4p5tv2a837mzqrst04d0dcptdjmluqvdx9k3',
  },
  {
    policyid: '1e349c9bdea19fd6c147626a5260bc44b71635f398b67c59881df209',
    assetname: '7eae28af2208be856f7a119668ae52a49b73725e326dc16579dcc373',
    assetfingerprint: 'asset1aqrdypg669jgazruv5ah07nuyqe0wxjhe2el6f',
  },
  {
    policyid: '7eae28af2208be856f7a119668ae52a49b73725e326dc16579dcc373',
    assetname: '1e349c9bdea19fd6c147626a5260bc44b71635f398b67c59881df209',
    assetfingerprint: 'asset17jd78wukhtrnmjh3fngzasxm8rck0l2r4hhyyt',
  },
  {
    policyid: '7eae28af2208be856f7a119668ae52a49b73725e326dc16579dcc373',
    assetname: '0000000000000000000000000000000000000000000000000000000000000000',
    assetfingerprint: 'asset1pkpwyknlvul7az0xx8czhl60pyel45rpje4z8w',
  },
]

describe('Asset fingerprint encoding', () => {
  it('should encode correct fingerprints for various policies and assetNames', () => {
    const testFingerprints = assetFingerprintTestVectors.map(
      ({assetfingerprint}) => assetfingerprint
    )
    const resultFingerprints = assetFingerprintTestVectors.map(({policyid, assetname}) =>
      encodeAssetFingerprint(policyid, assetname)
    )
    assert.deepEqual(testFingerprints, resultFingerprints)
  })
})
