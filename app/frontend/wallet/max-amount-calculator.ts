import {roundWholeAdas} from '../helpers/adaConverters'
import {Lovelace, _Address} from '../types'
import getDonationAddress from '../helpers/getDonationAddress'
import {computeRequiredTxFee} from './shelley/shelley-transaction-planner'
import {UTxO, _Output} from './types'

function getInputBalance(inputs: Array<UTxO>): Lovelace {
  return inputs.reduce((acc, input) => acc + input.coins, 0) as Lovelace
}

// TODO: when we remove the byron functionality we can remove the computeFeeFn as argument
export const MaxAmountCalculator = (computeRequiredTxFeeFn: typeof computeRequiredTxFee) => {
  function getMaxSendableAmount(profitableInputs: Array<UTxO>, address: _Address) {
    // as tokens for the max amount output we pass the longest tokens
    // to be precise we should pass the tokens that are the beggest when cborized
    const tokens = profitableInputs
      .map(({tokens}) => tokens)
      .reduce((acc, tokens) => (tokens.length > acc.length ? tokens : acc), [])
    const coins = getInputBalance(profitableInputs)

    const outputs: _Output[] = [{isChange: false, address, coins: 0 as Lovelace, tokens}]

    const txFee = computeRequiredTxFeeFn(profitableInputs, outputs)
    return {sendAmount: Math.max(coins - txFee, 0) as Lovelace}
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
