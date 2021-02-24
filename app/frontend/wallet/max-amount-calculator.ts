import {roundWholeAdas} from '../helpers/adaConverters'
import {Lovelace, _Address} from '../types'
import getDonationAddress from '../helpers/getDonationAddress'
import {computeRequiredTxFee} from './shelley/shelley-transaction-planner'
import {OutputType, UTxO, _Output} from './types'

function getInputBalance(inputs: Array<UTxO>): Lovelace {
  return inputs.reduce((acc, input) => acc + input.coins, 0) as Lovelace
}

// TODO: when we remove the byron functionality we can remove the computeFeeFn as argument
export const MaxAmountCalculator = (computeRequiredTxFeeFn: typeof computeRequiredTxFee) => {
  function getMaxSendableAmount(profitableInputs: Array<UTxO>, address: _Address) {
    const coins = getInputBalance(profitableInputs)

    const outputs: _Output[] = [{type: OutputType.NO_CHANGE, address, coins: 0 as Lovelace}]

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
      {type: OutputType.NO_CHANGE, address, coins: 0 as Lovelace},
      {type: OutputType.NO_CHANGE, address: getDonationAddress(), coins: 0 as Lovelace},
    ]

    const txFee = computeRequiredTxFeeFn(profitableInputs, outputs)
    return Math.max(coins - txFee - sendAmount, 0) as Lovelace
  }

  return {
    getMaxDonationAmount,
    getMaxSendableAmount,
  }
}
