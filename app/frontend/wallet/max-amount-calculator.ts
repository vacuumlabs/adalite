import {roundWholeAdas} from '../helpers/adaConverters'
import {Lovelace} from '../types'
import getDonationAddress from '../helpers/getDonationAddress'

type UTxO = {
  txHash: string
  address: string
  coins: Lovelace
  outputIndex: number
}

type Input = UTxO

function getInputBalance(inputs: Array<Input>): Lovelace {
  return inputs.reduce((acc, input) => acc + input.coins, 0) as Lovelace
}

export const MaxAmountCalculator = (computeRequiredTxFee) => {
  function getMaxSendableAmount(
    profitableInputs,
    address,
    hasDonation,
    donationAmount,
    donationType
  ) {
    const coins = getInputBalance(profitableInputs)

    if (!hasDonation) {
      const outputs = [{address, coins: 0 as Lovelace}]

      const txFee = computeRequiredTxFee(profitableInputs, outputs)
      return {sendAmount: Math.max(coins - txFee, 0)}
    } else {
      const outputs = [
        {address, coins: 0 as Lovelace},
        {address: getDonationAddress(), coins: 0 as Lovelace},
      ]
      const txFee = computeRequiredTxFee(profitableInputs, outputs)

      if (donationType === 'percentage') {
        // set maxSendAmount and percentageDonation (0.2% of max) to deplete balance completely
        const percent = 0.2

        const reducedAmount: Lovelace = Math.floor(coins / (1 + percent / 100)) as Lovelace
        const roundedDonation = roundWholeAdas(((reducedAmount * percent) / 100) as Lovelace)

        return {
          sendAmount: coins - txFee - roundedDonation,
          donationAmount: roundedDonation,
        }
      } else {
        return {sendAmount: Math.max(coins - donationAmount - txFee, 0)}
      }
    }
  }

  function getMaxDonationAmount(profitableInputs, address, sendAmount: Lovelace) {
    const coins = getInputBalance(profitableInputs)

    const outputs = [
      {address, coins: 0 as Lovelace},
      {address: getDonationAddress(), coins: 0 as Lovelace},
    ]

    const txFee = computeRequiredTxFee(profitableInputs, outputs)
    return Math.max(coins - txFee - sendAmount, 0)
  }

  return {
    getMaxDonationAmount,
    getMaxSendableAmount,
  }
}
