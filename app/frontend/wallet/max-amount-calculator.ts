import {AssetFamily, Lovelace, SendAmount, _Address} from '../types'
import getDonationAddress from '../helpers/getDonationAddress'
import {
  calculateMinUTxOLovelaceAmount,
  computeRequiredTxFee,
} from './shelley/shelley-transaction-planner'
import {UTxO, _Output} from './types'
import {aggregateTokens} from './helpers/tokenFormater'
import printAda from '../helpers/printAda'

function getInputBalance(inputs: Array<UTxO>): Lovelace {
  return inputs.reduce((acc, input) => acc + input.coins, 0) as Lovelace
}

// TODO: when we remove the byron functionality we can remove the computeFeeFn as argument
export const MaxAmountCalculator = (computeRequiredTxFeeFn: typeof computeRequiredTxFee) => {
  function getMaxSendableAmount(
    profitableInputs: Array<UTxO>,
    address: _Address,
    sendAmount: SendAmount
  ): SendAmount {
    // as tokens for the max amount output we pass the longest tokens
    // to be precise we should pass the tokens that are the beggest when cborized
    if (sendAmount.assetFamily === AssetFamily.ADA) {
      const tokens = aggregateTokens(profitableInputs.map(({tokens}) => tokens))
      const minUTxOLovelaceAmount = calculateMinUTxOLovelaceAmount(tokens)
      const coins = getInputBalance(profitableInputs)
      // TODO: edge case, if the amount of ada is too low an we cant split it into two outputs
      const outputs: _Output[] = [
        {isChange: false, address, coins: 0 as Lovelace, tokens: []},
        {isChange: false, address, coins: minUTxOLovelaceAmount, tokens},
      ]
      const txFee = computeRequiredTxFeeFn(profitableInputs, outputs)
      const amount = Math.max(coins - txFee - minUTxOLovelaceAmount, 0) as Lovelace
      return {assetFamily: AssetFamily.ADA, coins: amount, fieldValue: `${printAda(amount)}`}
    } else {
      const {token: sendToken} = sendAmount
      const tokens = aggregateTokens(profitableInputs.map(({tokens}) => tokens))
      // TODO: rename
      const theToken = tokens.find(
        (token) => token.policyId === sendToken.policyId && token.assetName === sendToken.assetName
      )
      // TODO: edge case, if the amount of ada is too low an we cant split it into two outputs
      return {
        assetFamily: AssetFamily.TOKEN,
        token: theToken,
        fieldValue: `${theToken.quantity}`,
      }
    }
  }

  function getMaxDonationAmount(
    profitableInputs: UTxO[],
    address: _Address,
    sendAmount: Lovelace
  ): Lovelace {
    const coins = getInputBalance(profitableInputs)

    const outputs: _Output[] = [
      {isChange: false, address, coins: 0 as Lovelace, tokens: []},
      {isChange: false, address: getDonationAddress(), coins: 0 as Lovelace, tokens: []},
    ]

    const txFee = computeRequiredTxFeeFn(profitableInputs, outputs)
    return Math.max(coins - txFee - sendAmount, 0) as Lovelace
  }

  return {
    getMaxDonationAmount,
    getMaxSendableAmount,
  }
}
