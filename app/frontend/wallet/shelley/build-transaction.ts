import {computeRequiredTxFee} from './helpers/chainlib-wrapper'
import _ from 'lodash'
import {Input, Output, TxPlan} from '../cardano-wallet'
import {Lovelace} from '../../state'

import NamedError from '../../helpers/NamedError'

import {ADALITE_CONFIG} from '../../config'

export function computeTxPlan(
  chainConfig,
  inputs: Array<Input>,
  outputs: Array<Output>,
  possibleChange: Output
): TxPlan | null {
  const totalInput = inputs.reduce((acc, input) => acc + input.coins, 0)
  const totalOutput = outputs.reduce((acc, output) => acc + output.coins, 0)

  if (totalOutput > Number.MAX_SAFE_INTEGER) {
    throw NamedError('CoinAmountError')
  }

  const feeWithoutChange = computeRequiredTxFee(chainConfig)(inputs, outputs, null)

  // Cannot construct transaction plan
  if (totalOutput + feeWithoutChange > totalInput) return null

  // No change necessary, perfect fit
  if (totalOutput + feeWithoutChange === totalInput) {
    return {inputs, outputs, change: null, fee: feeWithoutChange as Lovelace}
  }

  const feeWithChange = computeRequiredTxFee(chainConfig)(
    inputs,
    [...outputs, possibleChange],
    null
  )

  if (totalOutput + feeWithChange > totalInput) {
    // We cannot fit the change output into the transaction
    // and jormungandr does check for strict fee equality
    return null
  }

  return {
    inputs,
    outputs,
    change: {
      address: possibleChange.address,
      coins: (totalInput - totalOutput - feeWithChange) as Lovelace,
    },
    fee: feeWithChange as Lovelace,
  }
}

export function selectMinimalTxPlan(
  chainConfig,
  utxos: Array<any>,
  address,
  coins,
  donationAmount,
  changeAddress
): any {
  const profitableUtxos = utxos //utxos.filter(isUtxoProfitable)

  const inputs = []

  const outputs = [{address, coins}]
  if (donationAmount > 0) {
    outputs.push({address: ADALITE_CONFIG.ADA_DONATION_ADDRESS, coins: donationAmount})
  }

  const change = {address: changeAddress, coins: 0 as Lovelace}

  for (let i = 0; i < profitableUtxos.length; i++) {
    inputs.push(profitableUtxos[i])
    const plan = computeTxPlan(chainConfig, inputs, outputs, change)
    if (plan) return plan
  }

  return {estimatedFee: computeRequiredTxFee(chainConfig)(inputs, outputs, null)}
}

export function computeDelegationTxPlan(chainConfig, pools, accountCounter, privkey): any {
  // inputs: [
  //   {
  //     type: 'account',
  //     address,
  //     privkey,
  //     accountCounter: counter,
  //     value: computedFee,
  //   },
  // ],
  const extra = {
    type: 'stake_delegation',
    pools,
    privkey,
  }
  const inputs = []
  const outputs = []
  computeTxPlan(chainConfig, inputs, outputs, extra)
}
/*
export function buildTransactionFromAccount(account, destination) {
  const computedFee = calculateFee({
    chainConfig,
    inputCount: 1,
    outputCount: 1,
    certCount: 0,
  })
  const requiredAmount = destination.value + computedFee
  if (account.value < requiredAmount) {
    throw Error('Insufficient funds')
  }
  return buildTransaction({
    inputs: [
      {
        type: 'account',
        address: account.address,
        privkey: account.privkey_hex,
        accountCounter: account.counter,
        value: requiredAmount,
      },
    ],
    outputs: [destination],
    cert: null,
    chainConfig,
  })
}

export function buildTransactionFromUtxos(utxos, output, changeAddress) {
  // TODO: drop change if not needed
  const computedFee = calculateFee({
    chainConfig,
    inputCount: 1,
    outputCount: 2,
    certCount: 0,
  })
  const outputAmount = output.value
  const requiredAmount = outputAmount + computedFee

  const inputs = utxos.map((utxo) => ({type: 'utxo', ...utxo}))
  const selectedInputs = selectInputs(inputs, requiredAmount)
  const inputAmount = _.sumBy(selectedInputs, (inp) => inp.value)

  return buildTransaction({
    inputs: selectedInputs,
    outputs: [
      output,
      {
        address: changeAddress,
        value: inputAmount - outputAmount - computedFee,
      },
    ],
    cert: null,
    chainConfig,
  })
}
*/
