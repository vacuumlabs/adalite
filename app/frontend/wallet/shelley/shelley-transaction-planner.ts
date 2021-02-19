import {encode} from 'borc'

import {ShelleyTxInputFromUtxo, ShelleyWitdrawal, ShelleyTxCert} from './shelley-transaction'

import {TX_WITNESS_SIZES} from '../constants'
import CborIndefiniteLengthArray from '../byron/helpers/CborIndefiniteLengthArray'
import NamedError from '../../helpers/NamedError'
import {Lovelace, CertificateType} from '../../types'
import getDonationAddress from '../../helpers/getDonationAddress'
import {base58, bech32} from 'cardano-crypto.js'
import {isShelleyFormat, isV1Address} from './helpers/addresses'
import {transformPoolParamsTypes} from './helpers/poolCertificateUtils'

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
  accountAddress: string
}

type Cert = {
  type: number
  accountAddress: any
  poolHash: string | null
  poolRegistrationParams?: any
}
export interface TxPlan {
  inputs: Array<_Input>
  outputs: Array<_Output>
  change: _Output | null
  certificates: Array<_Certificate>
  deposit: Lovelace
  fee: Lovelace
  withdrawals: Array<_Withdrawal>
}

export function txFeeFunction(txSizeInBytes: number): Lovelace {
  const a = 155381
  const b = 43.946

  return Math.ceil(a + txSizeInBytes * b) as Lovelace
}

// Estimates size of final transaction in bytes.
// Note(ppershing): can overshoot a bit
export function estimateTxSize(
  inputs: Array<_Input>,
  outputs: Array<_Output>,
  certificates: Array<_Certificate>,
  withdrawals: Array<_Withdrawal>
): Lovelace {
  // the 1 is there for the key in the tx map
  const txInputsSize = encode(ShelleyTxInputs(inputs)).length + 1
  /*
  * we have to estimate size of tx outputs since we are calculating
  * fee also in cases we dont know the amount of coins in advance
  */
  const txOutputs: _Output[] = outputs.map((output) => ({
    address: output.address,
    coins: Number.MAX_SAFE_INTEGER as Lovelace,
  }))
  // TODO: max output size
  const txOutputsSize = encode(ShelleyTxOutputs(txOutputs)).length + 1

  const txCertificatesSize = encode(ShelleyTxCertificates(certificates)).length + 1
  const txWithdrawalsSize = encode(ShelleyTxWithdrawals(withdrawals)).length + 1
  const txTllSize = encode(Number.MAX_SAFE_INTEGER).length + 1
  const txFeeSize = encode(Number.MAX_SAFE_INTEGER).length + 1

  const txAuxSize =
    txInputsSize + txOutputsSize + txCertificatesSize + txWithdrawalsSize + txFeeSize + txTllSize

  const shelleyInputs = inputs.filter(({address}) => isShelleyFormat(address))
  const byronInputs = inputs.filter(({address}) => !isShelleyFormat(address))

  const shelleyWitnessesSize =
    (withdrawals.length + certificates.length + shelleyInputs.length) * TX_WITNESS_SIZES.shelley

  const byronWitnessesSize = byronInputs.reduce((acc, {address}) => {
    const witnessSize = isV1Address(address) ? TX_WITNESS_SIZES.byronV1 : TX_WITNESS_SIZES.byronv2
    return acc + witnessSize
  }, 0)

  const txWitnessesSize = shelleyWitnessesSize + byronWitnessesSize

  const txMetaSize = 1 // currently null

  // the 1 is there for the CBOR "tag" for an array of 2 elements
  const txSizeInBytes = 1 + txAuxSize + txWitnessesSize + txMetaSize

  if (txSizeInBytes > MAX_TX_SIZE) throw NamedError('TxTooBig')
  /*
  * the slack is there for the array of tx witnesses
  * because it may have more than 1 byte of overhead
  * if more than 16 elements are present
  */
  const slack = 1 // TODO

  return txSizeInBytes + slack
}

export function computeRequiredTxFee(
  inputs: Array<_Input>,
  outputs: Array<_Output>,
  certificates: Array<_Certificate> = [],
  withdrawals: Array<_Withdrawal> = []
): Lovelace {
  const fee = txFeeFunction(estimateTxSize(inputs, outputs, certificates, withdrawals))
  return fee
}

function computeRequiredDeposit(certificates: Array<_Certificate>): Lovelace {
  const CertificateDeposit: {[key in CertificateType]: number} = {
    [CertificateType.DELEGATION]: 0,
    [CertificateType.STAKEPOOL_REGISTRATION]: 500000000,
    [CertificateType.STAKING_KEY_REGISTRATION]: 2000000,
    [CertificateType.STAKING_KEY_DEREGISTRATION]: -2000000,
  }
  return certificates.reduce((acc, {type}) => acc + CertificateDeposit[type], 0) as Lovelace
}

export function computeTxPlan(
  inputs: Array<_Input>,
  outputs: Array<_Output>,
  possibleChange: _Output,
  certificates: Array<_Certificate>,
  withdrawals: Array<_Withdrawal>
): TxPlan {
  const totalRewards = withdrawals.reduce((acc, {rewards}) => acc + rewards, 0)
  const totalInput = inputs.reduce((acc, input) => acc + input.coins, 0) + totalRewards
  const deposit = computeRequiredDeposit(certificates)
  const totalOutput = outputs.reduce((acc, {coins}) => acc + coins, 0) + deposit + totalRewards

  if (totalOutput > Number.MAX_SAFE_INTEGER) {
    throw NamedError('CoinAmountError')
  }

  const feeWithoutChange = computeRequiredTxFee(inputs, outputs, certificates, withdrawals)

  // Cannot construct transaction plan
  if (totalOutput + feeWithoutChange > totalInput) {
    throw NamedError('CannotConstructTxPlan')
  }

  // No change necessary, perfect fit
  if (totalOutput + feeWithoutChange === totalInput) {
    return {
      inputs,
      outputs,
      change: null,
      certificates,
      deposit,
      fee: feeWithoutChange,
      withdrawals,
    }
  }

  const feeWithChange = computeRequiredTxFee(
    inputs,
    [...outputs, possibleChange],
    certificates,
    withdrawals
  )

  if (totalOutput + feeWithChange > totalInput) {
    // We cannot fit the change output into the transaction
    // Instead, just increase the fee
    return {
      inputs,
      outputs,
      change: null,
      certificates,
      deposit,
      fee: (totalInput - totalOutput) as Lovelace,
      withdrawals,
    }
  }

  const change = {
    address: possibleChange.address,
    coins: (totalInput - totalOutput - feeWithChange + totalRewards) as Lovelace,
  }

  if (!checkOutputs([...outputs, change], 0)) {
    return null
  }

  return {
    inputs,
    outputs,
    change,
    certificates,
    deposit,
    fee: feeWithChange,
    withdrawals,
  }
}

export function isUtxoProfitable(utxo: UTxO) {
  // in case of legacy utxos, we want to convert them even if they are non-profitable
  if (!isShelleyFormat(utxo.address)) return true
  const inputSize = encode(ShelleyTxInputFromUtxo(utxo)).length
  const addedCost = txFeeFunction(inputSize + TX_WITNESS_SIZES.shelley) - txFeeFunction(0)

  return utxo.coins > addedCost
}

function createCert(type, accountAddress, poolHash) {
  const certTypes = {
    staking_key_registration: CertificateType.STAKING_KEY_REGISTRATION,
    staking_key_deregistration: CertificateType.STAKING_KEY_DEREGISTRATION,
    delegation: CertificateType.DELEGATION,
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
  registerStakingKey = false,
  rewards = 0
): TxPlan | NoTxPlan {
  const certs = []
  const withdrawals: Array<Withdrawal> = []
  if (poolHash && registerStakingKey) {
    certs.push(createCert('staking_key_registration', accountAddress, null))
  }
  if (poolHash) {
    certs.push(createCert('delegation', accountAddress, poolHash))
  }
  if (rewards) {
    withdrawals.push({accountAddress, rewards: rewards as Lovelace})
  }
  const profitableUtxos = utxos.filter(isUtxoProfitable)

  const inputs = []

  const outputs = address ? [{address, coins, accountAddress}] : []
  if (donationAmount > 0) {
    outputs.push({
      address: getDonationAddress(),
      coins: donationAmount,
      accountAddress,
    })
  }

  const change = {address: changeAddress, coins: 0 as Lovelace, accountAddress}

  for (let i = 0; i < profitableUtxos.length; i++) {
    inputs.push(profitableUtxos[i])
    const plan = computeTxPlan(inputs, outputs, change, certs, withdrawals)
    if (plan) return plan
  }

  return {
    estimatedFee: computeRequiredTxFee(inputs, outputs, certs, withdrawals),
    error: {code: 'OutputTooSmall'},
  }
}

export const unsignedPoolTxToTxPlan = (unsignedTx, ownerCredentials): TxPlan => {
  return {
    inputs: unsignedTx.inputs.map((input) => ({
      outputIndex: input.outputIndex,
      txHash: input.txHash.toString('hex'),
      address: null,
      coins: null,
      // path
    })),
    outputs: unsignedTx.outputs.map((output) => ({
      coins: output.coins,
      address: bech32.encode('addr', output.address),
      accountAddress: null,
    })),
    change: null,
    certs: unsignedTx.certificates.map((cert) => ({
      type: cert.type,
      accountAddress: null,
      poolHash: null,
      poolRegistrationParams: transformPoolParamsTypes(cert, ownerCredentials),
    })),
    deposit: null,
    fee: parseInt(unsignedTx.fee, 10) as Lovelace,
    withdrawals: unsignedTx.withdrawals,
  }
}
