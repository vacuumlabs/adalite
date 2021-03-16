import {Token} from '../../types'
import * as _ from 'lodash' // TODO: import only needed methods
import {TokenObject} from '../backend-types'

// from adalite-backend

export const arraySum = (numbers: Array<number>): number =>
  numbers.reduce((acc: number, val) => acc + val, 0)

export const formatToken = (token: TokenObject): Token => ({
  ...token,
  quantity: parseInt(token.quantity, 10),
})

const aggregateTokensForPolicy = (policyGroup: Token[], policyId: string) =>
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

export const aggregateTokens = (tokens: Token[][]): Token[] =>
  _(tokens)
    .filter((token) => !!token.length)
    .flatten()
    .groupBy(({policyId}) => policyId)
    .map(aggregateTokensForPolicy)
    .flatten()
    .value()

export const groupTokensByPolicyId = (tokens: Token[]): {[policyId: string]: Token[]} => {
  return _(tokens)
    .groupBy(({policyId}) => policyId)
    .value()
}

export const getTokenDifference = (tokens1: Token[], tokens2: Token[]): Token[] => {
  const negativeTokens = tokens2.map((token) => ({...token, quantity: -token.quantity}))
  return aggregateTokens([tokens1, negativeTokens]).filter((token) => token.quantity !== 0)
}
