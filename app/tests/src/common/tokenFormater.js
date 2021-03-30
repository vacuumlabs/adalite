import assert from 'assert'
import {groupTokenBundleByPolicyId} from '../../../frontend/wallet/helpers/tokenFormater'

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
    assert.deepEqual(sortedTokenBundle, groupTokenBundleByPolicyId(tokenBundle))
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
    assert.deepEqual(sortedTokenBundle, groupTokenBundleByPolicyId(tokenBundle))
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
    assert.deepEqual(sortedTokenBundle, groupTokenBundleByPolicyId(tokenBundle))
  })
})
