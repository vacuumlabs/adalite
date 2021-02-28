import {AssetFamily, Lovelace, SendAmount, _Address} from '../types'
import getDonationAddress from '../helpers/getDonationAddress'
import {
  computeMinUTxOLovelaceAmount,
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
    if (sendAmount.assetFamily === AssetFamily.ADA) {
      const tokens = aggregateTokens(profitableInputs.map(({tokens}) => tokens))
      const inputBalance = getInputBalance(profitableInputs)
      const additionalLovelaceAmount = computeMinUTxOLovelaceAmount(address, inputBalance, tokens)
      // we also need a change output leaving tokens in account
      // TODO: we should probably leave there sufficient amount of ada for sending them somewhere
      const outputs: _Output[] = [
        {isChange: false, address, coins: 0 as Lovelace, tokens: []},
        {isChange: false, address, coins: additionalLovelaceAmount, tokens},
      ]
      const txFee = computeRequiredTxFeeFn(profitableInputs, outputs)
      const coins = Math.max(inputBalance - txFee - additionalLovelaceAmount, 0) as Lovelace

      return {assetFamily: AssetFamily.ADA, coins, fieldValue: `${printAda(coins)}`}
    } else {
      const tokens = aggregateTokens(profitableInputs.map(({tokens}) => tokens))
      const sendToken = tokens.find(
        (token) =>
          token.policyId === sendAmount.token.policyId &&
          token.assetName === sendAmount.token.assetName
      )

      return {
        assetFamily: AssetFamily.TOKEN,
        token: sendToken,
        fieldValue: `${sendToken.quantity}`,
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
