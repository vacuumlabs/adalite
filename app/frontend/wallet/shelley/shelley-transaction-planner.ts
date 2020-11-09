import {encode} from 'borc'

import {ShelleyTxInputFromUtxo, ShelleyWitdrawal, ShelleyTxCert} from './shelley-transaction'

import {TX_WITNESS_SIZES, CERTIFICATES_ENUM} from '../constants'
import CborIndefiniteLengthArray from '../byron/helpers/CborIndefiniteLengthArray'
import NamedError from '../../helpers/NamedError'
import {Lovelace} from '../../state'
import getDonationAddress from '../../helpers/getDonationAddress'
import {base58, bech32} from 'cardano-crypto.js'
import {isShelleyFormat, isV1Address} from './helpers/addresses'
import {buf2hex} from './helpers/chainlib-wrapper'
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

type Withdrawal = {
  accountAddress: string
  rewards: Lovelace
}

// Estimates size of final transaction in bytes.
// Note(ppershing): can overshoot a bit
export function estimateTxSize(
  inputs: Array<Input>,
  outputs: Array<Output>,
  certs: Array<Cert>,
  withdrawals: Array<Withdrawal>
): Lovelace {
  // exact size for inputs
  const preparedInputs = inputs.map(ShelleyTxInputFromUtxo)
  const txInputsSize = encode(new CborIndefiniteLengthArray(preparedInputs)).length

  const maxCborCoinsLen = 9 //length of CBOR encoded 64 bit integer, currently max supported
  const txOutputsSizes = outputs.map(
    // Note(ppershing): we are conservative here
    // FIXME(ppershing): shouldn't there be some +1 for the array encoding?
    // Is it in maxCborCoinsLen?
    ({address, coins}) =>
      isShelleyFormat(address)
        ? bech32.decode(address).data.length + maxCborCoinsLen
        : base58.decode(address).length + maxCborCoinsLen
  )
  // +2 for indef array start & end
  const txOutputsSize = txOutputsSizes.reduce((acc, x) => acc + x, 0) + 2

  let txCertSize = 0
  if (certs.length) {
    // TODO: refactor
    const preparedCerts = certs.map(
      ({type, accountAddress, poolHash}) =>
        encode(ShelleyTxCert(type, accountAddress, poolHash)).length
    )
    txCertSize = preparedCerts.reduce((acc, x) => acc + x, 0) + 2
  }

  let txWithdrawalsSize = 0
  if (withdrawals.length) {
    const preparedWithdrawals = withdrawals.map(
      ({accountAddress, rewards}) => encode(ShelleyWitdrawal(accountAddress, rewards)).length
    )
    txWithdrawalsSize = preparedWithdrawals.reduce((acc, x) => acc + x, 0) + 2
  }

  const txMetaSize = 1 // currently empty Map

  // the 1 is there for the CBOR "tag" for an array of 4 elements
  const txAuxSize = 1 + txInputsSize + txOutputsSize + txMetaSize + txCertSize + txWithdrawalsSize

  // TODO: refactor
  const shelleyInputs = inputs.filter(({address}) => isShelleyFormat(address))
  const byronInputs = inputs.filter(({address}) => !isShelleyFormat(address))

  const shelleyWitnessesSize =
    (withdrawals.length + certs.length + shelleyInputs.length) * TX_WITNESS_SIZES.shelley

  let byronWitnessesSize = 0
  if (byronInputs.length) {
    byronWitnessesSize =
      byronInputs.length *
      (isV1Address(byronInputs[0].address) ? TX_WITNESS_SIZES.byronV1 : TX_WITNESS_SIZES.byronv2)
  }

  const txWitnessesSize = shelleyWitnessesSize + byronWitnessesSize
  // TODO: also for withdrawals
  // the 1 is there for the CBOR "tag" for an array of 2 elements
  const txSizeInBytes = 1 + txAuxSize + txWitnessesSize

  /*
  * the slack is there for the array of tx witnesses
  * because it may have more than 1 byte of overhead
  * if more than 16 elements are present
  */
  const slack = 250 // TODO: this is too much

  return txSizeInBytes + slack
}

export function computeRequiredTxFee(
  inputs: Array<Input>,
  outputs: Array<Output>,
  certs: Array<Cert> = [],
  withdrawals: Array<Withdrawal> = []
): Lovelace {
  const fee = txFeeFunction(estimateTxSize(inputs, outputs, certs, withdrawals))
  return fee
}

function computeRequiredDeposit(certs: Array<Cert>): Lovelace {
  let deposit = 0
  for (const {type} of certs) {
    if (type === 0) deposit += 2000000
  }
  return deposit as Lovelace
}

export interface TxPlan {
  inputs: Array<Input>
  outputs: Array<Output>
  change: Output | null
  certs: Array<Cert>
  deposit: Lovelace
  fee: Lovelace
  withdrawals?: Array<Withdrawal>
}

interface NoTxPlan {
  estimatedFee: Lovelace
  error: {code: string}
}

const checkOutputs = (outputs, fee) => {
  for (const {coins} of outputs) {
    if (coins < 1000000 + fee) return false
  }
  return true
}

export function computeTxPlan(
  inputs: Array<Input>,
  outputs: Array<Output>,
  possibleChange: Output,
  certs: Array<Cert>,
  withdrawals: Array<Withdrawal>
): TxPlan | null {
  const withdrawalAmount = withdrawals && withdrawals.length ? withdrawals[0].rewards : 0
  const totalInput = inputs.reduce((acc, input) => acc + input.coins, 0) + withdrawalAmount
  const deposit = computeRequiredDeposit(certs)
  const totalOutput =
    outputs.reduce((acc, output) => acc + output.coins, 0) + deposit + withdrawalAmount

  if (totalOutput > Number.MAX_SAFE_INTEGER) {
    throw NamedError('CoinAmountError')
  }

  const feeWithoutChange = computeRequiredTxFee(inputs, outputs, certs, withdrawals)
  // Cannot construct transaction plan
  if (totalOutput + feeWithoutChange > totalInput) return null

  // No change necessary, perfect fit
  if (totalOutput + feeWithoutChange === totalInput) {
    if (checkOutputs(outputs, 0)) {
      return {
        inputs,
        outputs,
        change: null,
        certs,
        deposit,
        fee: feeWithoutChange as Lovelace,
        withdrawals,
      }
    }
  }

  const feeWithChange = computeRequiredTxFee(
    inputs,
    [...outputs, possibleChange],
    certs,
    withdrawals
  )

  if (totalOutput + feeWithChange > totalInput) {
    // We cannot fit the change output into the transaction
    // Instead, just increase the fee
    if (checkOutputs(outputs, 0)) {
      return {
        inputs,
        outputs,
        change: null,
        certs,
        deposit,
        fee: (totalInput - totalOutput) as Lovelace,
        withdrawals,
      }
    }
  }

  const change = {
    ...possibleChange,
    address: possibleChange.address,
    coins: (totalInput - totalOutput - feeWithChange + withdrawalAmount) as Lovelace,
  }

  if (!checkOutputs([...outputs, change], 0)) {
    return null
  }

  return {
    inputs,
    outputs,
    change,
    certs,
    deposit,
    fee: feeWithChange as Lovelace,
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
    staking_key_registration: CERTIFICATES_ENUM.STAKING_KEY_REGISTRATION,
    staking_key_deregistration: CERTIFICATES_ENUM.STAKING_KEY_DEREGISTRATION,
    delegation: CERTIFICATES_ENUM.DELEGATION,
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
