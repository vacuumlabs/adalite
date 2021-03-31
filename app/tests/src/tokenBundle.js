import assert from 'assert'
import {orderTokenBundle} from '../../frontend/wallet/helpers/tokenFormater'
import { computeMinUTxOLovelaceAmount } from '../../frontend/wallet/shelley/shelley-transaction-planner'

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
      {policyId: 'ca37dd6b151b6a1d023ecbd22d7e881d814b0c58a3a3148b42b865a0', assetName: '000000000000', quantity: 1},
      {policyId: 'ca37dd6b151b6a1d023ecbd22d7e881d814b0c58a3a3148b42b865a0', assetName: '', quantity: 1},
    ]
    assert.deepEqual(1629628, computeMinUTxOLovelaceAmount(tokenBundle))
  })
  it('should calculate min ADA value for multiple assets under multiple policies', () => {
    const tokenBundle = [
      {policyId: 'ca37dd6b151b6a1d023ecbd22d7e881d814b0c58a3a3148b42b865a0', assetName: '000000000000', quantity: 1},
      {policyId: '6b8d07d69639e9413dd637a1a815a7323c69c86abbafb66dbfdb1aa7', assetName: '111111111111', quantity: 1},
    ]
    assert.deepEqual(1666665, computeMinUTxOLovelaceAmount(tokenBundle))
  })
  it('should calculate min ADA value for multiple assets under multiple policies with same assetName', () => {
    const tokenBundle = [
      {policyId: 'ca37dd6b151b6a1d023ecbd22d7e881d814b0c58a3a3148b42b865a0', assetName: '000000000000', quantity: 1},
      {policyId: '6b8d07d69639e9413dd637a1a815a7323c69c86abbafb66dbfdb1aa7', assetName: '000000000000', quantity: 1},
    ]
    assert.deepEqual(1666665, computeMinUTxOLovelaceAmount(tokenBundle))
  })
})


