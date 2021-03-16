import {Token, TokenBundle} from '../../types'
import * as _ from 'lodash' // TODO: import only needed methods
import {TokenObject} from '../backend-types'

// from adalite-backend

export const arraySum = (numbers: Array<number>): number =>
  numbers.reduce((acc: number, val) => acc + val, 0)

export const parseToken = (token: TokenObject): Token => ({
  ...token,
  quantity: parseInt(token.quantity, 10),
})

const aggregateTokenBundlesForPolicy = (policyGroup: TokenBundle, policyId: string) =>
  _(policyGroup)
    .groupBy(({assetName}) => assetName)
    .map((assetGroup, assetName) =>
      parseToken({
        policyId,
        assetName,
        quantity: `${arraySum(assetGroup.map((asset) => asset.quantity))}`,
      })
    )
    .value()

export const aggregateTokenBundles = (tokenBundle: TokenBundle[]): TokenBundle =>
  _(tokenBundle)
    .filter((token) => !!token.length)
    .flatten()
    .groupBy(({policyId}) => policyId)
    .map(aggregateTokenBundlesForPolicy)
    .flatten()
    .value()

export const groupTokenBundleByPolicyId = (
  tokenBundle: TokenBundle
): {[policyId: string]: TokenBundle} => {
  return _(tokenBundle)
    .groupBy(({policyId}) => policyId)
    .value()
}

export const getTokenBundlesDifference = (
  tokenBundle1: TokenBundle,
  tokenBundle2: TokenBundle
): TokenBundle => {
  const negativeTokenBundle = tokenBundle2.map((token) => ({...token, quantity: -token.quantity}))
  return aggregateTokenBundles([tokenBundle1, negativeTokenBundle]).filter(
    (token) => token.quantity !== 0
  )
}
