import {encode} from 'borc'
import bech32 from './helpers/bech32'

import {ShelleyTxInputFromUtxo} from './shelley-transaction'

import {TX_WITNESS_SIZE_BYTES} from '../constants'
import CborIndefiniteLengthArray from '../byron/helpers/CborIndefiniteLengthArray'
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

type Cert = {
  type: number
  accountAddressPath: any
  poolHash: string | null
}

// Estimates size of final transaction in bytes.
// Note(ppershing): can overshoot a bit
export function estimateTxSize(
  inputs: Array<Input>,
  outputs: Array<Output>,
  certs: Array<Cert>
): Lovelace {
  // exact size for inputs
  const preparedInputs = inputs.map(ShelleyTxInputFromUtxo)
  const txInputsSize = encode(new CborIndefiniteLengthArray(preparedInputs)).length

  const maxCborCoinsLen = 9 //length of CBOR encoded 64 bit integer, currently max supported
  const txOutputsSizes = outputs.map(
    // Note(ppershing): we are conservative here
    // FIXME(ppershing): shouldn't there be some +1 for the array encoding?
    // Is it in maxCborCoinsLen?
    ({address, coins}) => bech32.decode(address).data.length + maxCborCoinsLen
  )
  // +2 for indef array start & end
  const txOutputsSize = txOutputsSizes.reduce((acc, x) => acc + x, 0) + 2

  const preparedCerts = certs.map(
    (cert) => encode(new CborIndefiniteLengthArray(preparedInputs)).length
  )

  const txCertSize = preparedCerts.reduce((acc, x) => acc + x, 0) + 2

  const txMetaSize = 1 // currently empty Map

  // the 1 is there for the CBOR "tag" for an array of 4 elements
  const txAuxSize = 1 + txInputsSize + txOutputsSize + txMetaSize + txCertSize

  const txWitnessesSize = (certs.length + inputs.length) * TX_WITNESS_SIZE_BYTES + 1
  // TODO: also for withdrawals
  // the 1 is there for the CBOR "tag" for an array of 2 elements
  const txSizeInBytes = 1 + txAuxSize + txWitnessesSize

  /*
  * the slack is there for the array of tx witnesses
  * because it may have more than 1 byte of overhead
  * if more than 16 elements are present
  */
  const slack = 50 // TODO: this is too much

  return txSizeInBytes + slack
}

export function computeRequiredTxFee(
  inputs: Array<Input>,
  outputs: Array<Output>,
  certs: Array<Cert> = []
): Lovelace {
  const fee = txFeeFunction(estimateTxSize(inputs, outputs, certs))
  return fee
}

function computeRequiredDeposit(certs: Array<Cert>): Lovelace {
  let deposit = 0
  for (const {type} of certs) {
    if (type === 0) deposit += 2000000
  }
  return deposit as Lovelace
}

interface TxPlan {
  inputs: Array<Input>
  outputs: Array<Output>
  change: Output | null
  certs: Array<Cert>
  deposit: Lovelace
  fee: Lovelace
}

interface NoTxPlan {
  estimatedFee: Lovelace
}

export function computeTxPlan(
  inputs: Array<Input>,
  outputs: Array<Output>,
  possibleChange: Output,
  certs: Array<Cert>
): TxPlan | null {
  const totalInput = inputs.reduce((acc, input) => acc + input.coins, 0)
  const deposit = computeRequiredDeposit(certs)
  const totalOutput = outputs.reduce((acc, output) => acc + output.coins, 0) + deposit

  if (totalOutput > Number.MAX_SAFE_INTEGER) {
    throw NamedError('CoinAmountError')
  }

  const feeWithoutChange = computeRequiredTxFee(inputs, outputs, certs)
  // Cannot construct transaction plan
  if (totalOutput + feeWithoutChange > totalInput) return null

  // No change necessary, perfect fit
  if (totalOutput + feeWithoutChange === totalInput) {
    return {inputs, outputs, change: null, certs, deposit, fee: feeWithoutChange as Lovelace}
  }

  const feeWithChange = computeRequiredTxFee(inputs, [...outputs, possibleChange], certs)

  if (totalOutput + feeWithChange > totalInput) {
    // We cannot fit the change output into the transaction
    // Instead, just increase the fee
    return {
      inputs,
      outputs,
      change: null,
      certs,
      deposit,
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
    certs,
    deposit,
    fee: feeWithChange as Lovelace,
  }
}

export function isUtxoProfitable(utxo: UTxO) {
  const inputSize = encode(ShelleyTxInputFromUtxo(utxo)).length
  const addedCost = txFeeFunction(inputSize + TX_WITNESS_SIZE_BYTES) - txFeeFunction(0)

  return utxo.coins > addedCost
}

function createCert(type, accountAddress, poolHash) {
  const certTypes = {
    staking_key_registration: 0,
    staking_key_deregistration: 1,
    delegation: 2,
  }
  return {
    type: certTypes[type],
    accountAddress,
    poolHash,
  }
}

export function selectMinimalTxPlan(
  utxos: Array<UTxO>,
  address,
  coins,
  donationAmount,
  changeAddress,
  accountAddress,
  poolHash = null,
  registerStakingKey = false
): TxPlan | NoTxPlan {
  const certs = []
  if (poolHash && registerStakingKey) {
    certs.push(createCert('staking_key_registration', accountAddress, null))
  }
  if (poolHash) {
    certs.push(createCert('delegation', accountAddress, poolHash))
  }
  const profitableUtxos = utxos.filter(isUtxoProfitable)

  const inputs = []

  const outputs = address ? [{address, coins}] : []
  if (donationAmount > 0) outputs.push({address: getDonationAddress(), coins: donationAmount})

  const change = {address: changeAddress, coins: 0 as Lovelace}

  for (let i = 0; i < profitableUtxos.length; i++) {
    inputs.push(profitableUtxos[i])
    const plan = computeTxPlan(inputs, outputs, change, certs)
    if (plan) return plan
  }

  return {estimatedFee: computeRequiredTxFee(inputs, outputs, certs)}
}
