import {encode} from 'borc'
import {base58} from 'cardano-crypto.js'

import {TxInputFromUtxo} from './byron-transaction'

import {TX_WITNESS_SIZE_BYTES} from '../constants'
import CborIndefiniteLengthArray from './helpers/CborIndefiniteLengthArray'
import NamedError from '../../helpers/NamedError'
import {Lovelace} from '../../state'
import getDonationAddress from '../../helpers/getDonationAddress'

export function txFeeFunction(txSizeInBytes: number): Lovelace {
  const a = 155381
  const b = 43.946

  return Math.ceil(a + txSizeInBytes * b) as Lovelace
}

type UTxO = {
  txHash: string
  address: string
  coins: Lovelace
  outputIndex: number
}

type Input = UTxO

type Output = {
  address: string
  coins: Lovelace
}

// Estimates size of final transaction in bytes.
// Note(ppershing): can overshoot a bit
export function estimateTxSize(inputs: Array<Input>, outputs: Array<Output>): Lovelace {
  // exact size for inputs
  const preparedInputs = inputs.map(TxInputFromUtxo)
  const txInputsSize = encode(new CborIndefiniteLengthArray(preparedInputs)).length

  const maxCborCoinsLen = 9 //length of CBOR encoded 64 bit integer, currently max supported

  const txOutputsSizes = outputs.map(
    // Note(ppershing): we are conservative here
    // FIXME(ppershing): shouldn't there be some +1 for the array encoding?
    // Is it in maxCborCoinsLen?
    ({address, coins}) => base58.decode(address).length + maxCborCoinsLen
  )

  // +2 for indef array start & end
  const txOutputsSize = txOutputsSizes.reduce((acc, x) => acc + x, 0) + 2

  const txMetaSize = 1 // currently empty Map

  // the 1 is there for the CBOR "tag" for an array of 4 elements
  const txAuxSize = 1 + txInputsSize + txOutputsSize + txMetaSize

  const txWitnessesSize = inputs.length * TX_WITNESS_SIZE_BYTES + 1

  // the 1 is there for the CBOR "tag" for an array of 2 elements
  const txSizeInBytes = 1 + txAuxSize + txWitnessesSize

  /*
  * the slack is there for the array of tx witnesses
  * because it may have more than 1 byte of overhead
  * if more than 16 elements are present
  */
  const slack = 4

  return txSizeInBytes + slack
}

export function computeRequiredTxFee(inputs: Array<Input>, outputs: Array<Output>): Lovelace {
  const fee = txFeeFunction(estimateTxSize(inputs, outputs))
  return fee
}

interface TxPlan {
  inputs: Array<Input>
  outputs: Array<Output>
  change: Output | null
  fee: Lovelace
}

interface NoTxPlan {
  estimatedFee: Lovelace
}

export function computeTxPlan(
  inputs: Array<Input>,
  outputs: Array<Output>,
  possibleChange: Output
): TxPlan | null {
  const totalInput = inputs.reduce((acc, input) => acc + input.coins, 0)
  const totalOutput = outputs.reduce((acc, output) => acc + output.coins, 0)

  if (totalOutput > Number.MAX_SAFE_INTEGER) {
    throw NamedError('CoinAmountError')
  }

  const feeWithoutChange = computeRequiredTxFee(inputs, outputs)

  // Cannot construct transaction plan
  if (totalOutput + feeWithoutChange > totalInput) return null

  // No change necessary, perfect fit
  if (totalOutput + feeWithoutChange === totalInput) {
    return {inputs, outputs, change: null, fee: feeWithoutChange as Lovelace}
  }

  const feeWithChange = computeRequiredTxFee(inputs, [...outputs, possibleChange])

  if (totalOutput + feeWithChange > totalInput) {
    // We cannot fit the change output into the transaction
    // Instead, just increase the fee
    return {
      inputs,
      outputs,
      change: null,
      fee: (totalOutput - totalInput) as Lovelace,
    }
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

export function isUtxoProfitable(utxo: UTxO) {
  const inputSize = encode(TxInputFromUtxo(utxo)).length
  const addedCost = txFeeFunction(inputSize + TX_WITNESS_SIZE_BYTES) - txFeeFunction(0)

  return utxo.coins > addedCost
}

export function selectMinimalTxPlan(
  utxos: Array<UTxO>,
  address,
  coins,
  donationAmount,
  changeAddress
): TxPlan | NoTxPlan {
  const profitableUtxos = utxos.filter(isUtxoProfitable)

  const inputs = []

  const outputs = [{address, coins}]
  if (donationAmount > 0) outputs.push({address: getDonationAddress(), coins: donationAmount})

  const change = {address: changeAddress, coins: 0 as Lovelace}

  for (let i = 0; i < profitableUtxos.length; i++) {
    inputs.push(profitableUtxos[i])
    const plan = computeTxPlan(inputs, outputs, change)
    if (plan) return plan
  }

  return {estimatedFee: computeRequiredTxFee(inputs, outputs)}
}
