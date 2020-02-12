import {computeRequiredTxFee} from './helpers/chainlib-wrapper'
import _ from 'lodash'
// import {Input, Output, TxPlan} from '../cardano-wallet'
import {Lovelace} from '../../state'

import NamedError from '../../helpers/NamedError'

import {ADALITE_CONFIG} from '../../config'

type UTxOInput = {
  txHash: string
  address: string
  coins: Lovelace
  outputIndex: number
}

type AccountInput = {
  address: string
  coins: Lovelace
  counter: number
}

export type Input = UTxOInput | AccountInput

export type Output = {
  address: string
  coins: Lovelace
}

export interface TxPlan {
  type: string
  inputs: Array<Input>
  outputs: Array<Output>
  change: Output | null
  cert?: Array<{id: string; ratio: number}>
  fee: Lovelace
}

export function computeTxPlan(
  type,
  chainConfig,
  inputs: Array<Input>,
  outputs: Array<Output>,
  possibleChange?: Output,
  cert?: any
): TxPlan | null {
  const totalInput = inputs.reduce((acc, input) => acc + input.coins, 0)
  const totalOutput = outputs.reduce((acc, output) => acc + output.coins, 0)

  if (totalOutput > Number.MAX_SAFE_INTEGER) {
    throw NamedError('CoinAmountError')
  }

  const feeWithoutChange = computeRequiredTxFee(chainConfig)(inputs, outputs, cert)

  // Cannot construct transaction plan
  if (totalOutput + feeWithoutChange > totalInput) return null

  // No change necessary, perfect fit or a account tx
  if (totalOutput + feeWithoutChange === totalInput) {
    return {type, inputs, outputs, change: null, cert, fee: feeWithoutChange as Lovelace}
  }

  const feeWithChange = computeRequiredTxFee(chainConfig)(
    inputs,
    [...outputs, possibleChange],
    cert
  )

  if (totalOutput + feeWithChange > totalInput) {
    // We cannot fit the change output into the transaction
    // and jormungandr does check for strict fee equality
    return null
  }

  console.log('inputs: ', inputs)

  return {
    type,
    inputs,
    outputs,
    change: {
      address: possibleChange.address,
      coins: (totalInput - totalOutput - feeWithChange) as Lovelace,
    },
    cert,
    fee: feeWithChange as Lovelace,
  }
}

export function selectMinimalTxPlan(
  // TODO refactor to "minimalUtxoTxPlan"
  chainConfig,
  utxos: Array<any>,
  address,
  donationAmount,
  changeAddress,
  coins?,
  pools?,
  accountAddress?
): any {
  const profitableUtxos = utxos //utxos.filter(isUtxoProfitable)

  const inputs = []

  const cert = pools
    ? {
      type: 'certificate_stake_delegation',
      pools,
      accountAddress,
    }
    : null

  coins = coins || computeRequiredTxFee(chainConfig)([{address}], [], cert)

  const outputs = address ? [{address, coins}] : []
  if (donationAmount > 0) {
    outputs.push({address: ADALITE_CONFIG.ADA_DONATION_ADDRESS, coins: donationAmount})
  }

  const change = {address: changeAddress, coins: 0 as Lovelace}

  for (let i = 0; i < profitableUtxos.length; i++) {
    inputs.push(profitableUtxos[i])
    const plan = computeTxPlan('utxo', chainConfig, inputs, outputs, change, cert)
    if (plan) return plan
  }

  return {estimatedFee: computeRequiredTxFee(chainConfig)(inputs, outputs, cert)}
}

export function computeAccountTxPlan(
  chainConfig,
  dstAddress,
  amount,
  srcAddress,
  pools,
  counter,
  value
): any {
  const cert = pools
    ? {
      type: 'certificate_stake_delegation',
      pools,
    }
    : null
  const coins = value || computeRequiredTxFee(chainConfig)({srcAddress}, [], cert)
  const inputs = [
    {
      address: srcAddress,
      counter,
      coins,
    },
  ]
  const outputs = amount ? [{address: dstAddress, coins: amount}] : []

  return computeTxPlan('account', chainConfig, inputs, outputs, null, cert)
}
