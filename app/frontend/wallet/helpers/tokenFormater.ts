import {Token} from '../../types'
import * as _ from 'lodash' // TODO: import only needed methods
import {TokenObject} from '../backend-types'

// from adalite-backend

export const arraySum = (numbers: Array<number>): number =>
  numbers.reduce((acc: number, val) => acc + val, 0)

export const formatToken = (token: TokenObject, multiplier: number = 1): Token => ({
  policyId: token.policyId,
  assetName: token.assetName,
  quantity: multiplier * parseInt(token.quantity, 10),
})

const aggregateTokensForPolicy = (policyGroup: Array<Token>, policyId: string) =>
  _(policyGroup)
    .groupBy(({assetName}) => assetName)
    .map((assetGroup, assetName) =>
      formatToken({
        policyId,
        assetName,
        quantity: `${arraySum(assetGroup.map((asset) => asset.quantity))}`,
      })
    )
    .value()

export const aggregateTokens = (tokens: Array<Array<Token>>): Array<Token> =>
  _(tokens)
    .filter((token) => !!token.length)
    .flatten()
    .groupBy(({policyId}) => policyId)
    .map(aggregateTokensForPolicy)
    .flatten()
    .value()

export const tokens2TokenObject = (tokens: Token[]) => {
  return _(tokens)
    .groupBy(({policyId}) => policyId)
    .map((policyGroup, policyId) => [
      policyId,
      _(policyGroup)
        .keyBy('assetName')
        .mapValues('quantity')
        .value(),
    ])
    .fromPairs()
    .value()
}
