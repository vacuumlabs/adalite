import {AssetFamily, Lovelace, SendAmount, Address} from '../types'
import getDonationAddress from '../helpers/getDonationAddress'
import {computeRequiredTxFee} from './shelley/transaction'
import {UTxO, TxOutput} from './types'
import {aggregateTokenBundles} from './helpers/tokenFormater'
import printAda from '../helpers/printAda'
import {MAX_OUTPUT_TOKENS} from './shelley/transaction/constants'
import {createTokenChangeOutputs} from './shelley/transaction/utils'
import printTokenAmount from '../helpers/printTokenAmount'

function getInputBalance(inputs: Array<UTxO>): Lovelace {
  return inputs.reduce((acc, input) => acc + input.coins, 0) as Lovelace
}

// TODO: when we remove the byron functionality we can remove the computeFeeFn as argument
export const MaxAmountCalculator = () => {
  function getMaxSendableAmount(
    profitableInputs: Array<UTxO>,
    address: Address,
    sendAmount: SendAmount,
    decimals: number = 0
  ): SendAmount {
    if (sendAmount.assetFamily === AssetFamily.ADA) {
      const inputsTokenBundle = aggregateTokenBundles(
        profitableInputs.map(({tokenBundle}) => tokenBundle)
      )
      const inputBalance = getInputBalance(profitableInputs)

      const tokenChangeOutputs = createTokenChangeOutputs(
        address,
        inputsTokenBundle,
        MAX_OUTPUT_TOKENS
      )

      const minimalTokenChangeLovelace: Lovelace =
        inputsTokenBundle.length > 0
          ? (tokenChangeOutputs.reduce((acc, {coins}) => acc + coins, 0) as Lovelace)
          : (0 as Lovelace)

      // we also need a change output leaving tokenBundle in account
      // TODO: we should probably leave there sufficient amount of ada for sending them somewhere
      const outputs: TxOutput[] = [
        {isChange: false, address, coins: 0 as Lovelace, tokenBundle: []},
        ...tokenChangeOutputs,
      ]
      const txFee = computeRequiredTxFee(profitableInputs, outputs)
      const coins = Math.max(inputBalance - txFee - minimalTokenChangeLovelace, 0) as Lovelace

      return {assetFamily: AssetFamily.ADA, coins, fieldValue: `${printAda(coins)}`}
    } else {
      const inputsTokenBundle = aggregateTokenBundles(
        profitableInputs.map(({tokenBundle}) => tokenBundle)
      )
      const sendToken = inputsTokenBundle.find(
        (token) =>
          token.policyId === sendAmount.token.policyId &&
          token.assetName === sendAmount.token.assetName
      )

      return {
        assetFamily: AssetFamily.TOKEN,
        token: sendToken,
        fieldValue: printTokenAmount(sendToken.quantity, decimals),
      }
    }
  }

  function getMaxDonationAmount(
    profitableInputs: UTxO[],
    address: Address,
    sendAmount: Lovelace
  ): Lovelace {
    const coins = getInputBalance(profitableInputs)

    const outputs: TxOutput[] = [
      {isChange: false, address, coins: 0 as Lovelace, tokenBundle: []},
      {isChange: false, address: getDonationAddress(), coins: 0 as Lovelace, tokenBundle: []},
    ]

    const txFee = computeRequiredTxFee(profitableInputs, outputs)
    return Math.max(coins - txFee - sendAmount, 0) as Lovelace
  }

  return {
    getMaxDonationAmount,
    getMaxSendableAmount,
  }
}
