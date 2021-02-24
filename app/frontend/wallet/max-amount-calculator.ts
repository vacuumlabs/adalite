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
  function getMaxSendableAmount(
    profitableInputs: Array<UTxO>,
    address: _Address,
    hasDonation: boolean,
    donationAmount: Lovelace,
    donationType // TODO: enum
  ) {
    const coins = getInputBalance(profitableInputs)

    if (!hasDonation) {
      const outputs: _Output[] = [{type: OutputType.NO_CHANGE, address, coins: 0 as Lovelace}]

      const txFee = computeRequiredTxFeeFn(profitableInputs, outputs)
      return {sendAmount: Math.max(coins - txFee, 0) as Lovelace}
    } else {
      const outputs: _Output[] = [
        {type: OutputType.NO_CHANGE, address, coins: 0 as Lovelace},
        {type: OutputType.NO_CHANGE, address: getDonationAddress(), coins: 0 as Lovelace},
      ]
      const txFee = computeRequiredTxFeeFn(profitableInputs, outputs)

      if (donationType === 'percentage') {
        // set maxSendAmount and percentageDonation (0.2% of max) to deplete balance completely
        const percent = 0.2

        const reducedAmount: Lovelace = Math.floor(coins / (1 + percent / 100)) as Lovelace
        const roundedDonation = roundWholeAdas(((reducedAmount * percent) / 100) as Lovelace)

        return {
          sendAmount: (coins - txFee - roundedDonation) as Lovelace,
          donationAmount: roundedDonation,
        }
      } else {
        return {sendAmount: Math.max(coins - donationAmount - txFee, 0) as Lovelace}
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
