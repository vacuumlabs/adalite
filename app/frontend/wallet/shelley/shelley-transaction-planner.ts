import {encode} from 'borc'
import {
  ShelleyTxCertificates,
  ShelleyTxInputs,
  ShelleyTxOutputs,
  ShelleyTxWithdrawals,
} from './shelley-transaction'
import {MAX_TX_SIZE, TX_WITNESS_SIZES} from '../constants'
import CborIndefiniteLengthArray from '../byron/helpers/CborIndefiniteLengthArray'
import NamedError from '../../helpers/NamedError'
import {
  Lovelace,
  CertificateType,
  TxPlanArgs,
  _Address,
  TxType,
  SendAdaTxPlanArgs,
  DelegateAdaTxPlanArgs,
  WithdrawRewardsTxPlanArgs,
  ConvertLegacyAdaTxPlanArgs,
  Token,
  AssetType,
} from '../../types'
import {base58, bech32} from 'cardano-crypto.js'
import {isShelleyFormat, isV1Address} from './helpers/addresses'
import {transformPoolParamsTypes} from './helpers/poolCertificateUtils'
import {
  UTxO,
  _Certificate,
  _DelegationCertificate,
  _Input,
  _Output,
  _StakingKeyRegistrationCertificate,
  _Withdrawal,
} from '../types'
import {aggregateTokens, formatToken} from '../helpers/tokenFormater'

type TxPlanDraft = {
  outputs: _Output[]
  certificates: _Certificate[]
  withdrawals: _Withdrawal[]
}

export const enum TxPlanResultType {
  SUCCESS,
  FAILURE,
}

export type TxPlanResult =
  | {
      type: TxPlanResultType.SUCCESS
      txPlan: TxPlan
    }
  | {
      type: TxPlanResultType.FAILURE
      error: any
      estimatedFee: Lovelace
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
    isChange: false,
    address: output.address,
    coins: Number.MAX_SAFE_INTEGER as Lovelace,
    tokens: output.tokens,
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
  const totalInputTokens = aggregateTokens(inputs.map(({tokens}) => tokens))
  const deposit = computeRequiredDeposit(certificates)
  const totalOutput = outputs.reduce((acc, {coins}) => acc + coins, 0) + deposit + totalRewards
  const totalOutputTokens = aggregateTokens(outputs.map(({tokens}) => tokens)).map((token) =>
    formatToken({...token, quantity: `${token.quantity}`}, -1)
  )

  const tokenDifference = aggregateTokens([totalInputTokens, totalOutputTokens])

  // Cannot construct transaction plan, not enought tokens
  if (tokenDifference.some(({quantity}) => quantity < 0)) {
    throw NamedError('CannotConstructTxPlan')
  }

  if (
    totalOutput > Number.MAX_SAFE_INTEGER ||
    totalOutputTokens.some(({quantity}) => quantity > Number.MAX_SAFE_INTEGER)
  ) {
    throw NamedError('CoinAmountError')
  }

  const feeWithoutChange = computeRequiredTxFee(inputs, outputs, certificates, withdrawals)

  // Cannot construct transaction plan
  if (totalOutput + feeWithoutChange > totalInput) {
    throw NamedError('CannotConstructTxPlan')
  }

  // No change necessary, perfect fit
  if (totalOutput + feeWithoutChange === totalInput && tokenDifference.length === 0) {
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

  const change = {
    ...possibleChange,
    tokens: tokenDifference,
  }

  const feeWithChange = computeRequiredTxFee(
    inputs,
    [...outputs, change],
    certificates,
    withdrawals
  )

  if (totalOutput + feeWithChange > totalInput && tokenDifference.length === 0) {
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

  return {
    inputs,
    outputs,
    change: {
      ...change,
      coins: (totalInput - totalOutput - feeWithChange + totalRewards) as Lovelace,
    },
    certificates,
    deposit,
    fee: feeWithChange,
    withdrawals,
  }
}

// TODO: remove this altogether, since shelley all utxos are profitable
export const isUtxoProfitable = (utxo: UTxO): boolean => {
  return true
}

const validateTxPlan = (txPlan: TxPlan): void => {
  const outputs = txPlan.change ? [...txPlan.outputs, txPlan.change] : txPlan.outputs
  if (outputs.some(({coins}) => coins < 1000000)) {
    throw NamedError('OutputTooSmall')
  }
  const totalRewards = txPlan.withdrawals.reduce((acc, {rewards}) => acc + rewards, 0)
  if (totalRewards > 0 && totalRewards < txPlan.fee) {
    throw NamedError('RewardsBalanceTooLow')
  }
}

export const calculateMinUTxOLovelaceAmount = (tokens: Token[]) => {
  return 2000000 as Lovelace
}

const prepareTxPlanDraft = (txPlanArgs: TxPlanArgs): TxPlanDraft => {
  const prepareSendAdaTx = (
    txPlanArgs: SendAdaTxPlanArgs | ConvertLegacyAdaTxPlanArgs
  ): TxPlanDraft => {
    const outputs: _Output[] = []
    if (txPlanArgs.sendAmount.assetType === AssetType.ADA) {
      outputs.push({
        isChange: false,
        address: txPlanArgs.address,
        coins: txPlanArgs.sendAmount.coins,
        tokens: [],
      })
    } else {
      outputs.push({
        isChange: false,
        address: txPlanArgs.address,
        coins: calculateMinUTxOLovelaceAmount([txPlanArgs.sendAmount.token]),
        tokens: [txPlanArgs.sendAmount.token],
      })
    }

    return {
      outputs,
      certificates: [],
      withdrawals: [],
    }
  }

  const prepareDelegationTx = (txPlanArgs: DelegateAdaTxPlanArgs): TxPlanDraft => {
    const certificates: _Certificate[] = []
    if (!txPlanArgs.isStakingKeyRegistered) {
      const registrationCertificate: _StakingKeyRegistrationCertificate = {
        type: CertificateType.STAKING_KEY_REGISTRATION,
        stakingAddress: txPlanArgs.stakingAddress,
      }
      certificates.push(registrationCertificate)
    }
    if (txPlanArgs.poolHash) {
      const delegationCertificate: _DelegationCertificate = {
        type: CertificateType.DELEGATION,
        stakingAddress: txPlanArgs.stakingAddress,
        poolHash: txPlanArgs.poolHash,
      }
      certificates.push(delegationCertificate)
    }
    return {
      outputs: [],
      certificates,
      withdrawals: [],
    }
  }

  const prepareWithdrawalTx = (txPlanArgs: WithdrawRewardsTxPlanArgs): TxPlanDraft => {
    const withdrawals: _Withdrawal[] = []
    withdrawals.push({stakingAddress: txPlanArgs.stakingAddress, rewards: txPlanArgs.rewards})
    return {
      outputs: [],
      certificates: [],
      withdrawals,
    }
  }

  switch (txPlanArgs.txType) {
    case TxType.SEND_ADA:
      return prepareSendAdaTx(txPlanArgs)
    case TxType.DELEGATE:
      return prepareDelegationTx(txPlanArgs)
    case TxType.WITHDRAW:
      return prepareWithdrawalTx(txPlanArgs)
    case TxType.CONVERT_LEGACY:
      return prepareSendAdaTx(txPlanArgs)
    default:
      throw NamedError('InvalidTxPlanType')
  }
}

export const selectMinimalTxPlan = (
  utxos: Array<UTxO>,
  changeAddress: _Address,
  txPlanArgs: TxPlanArgs
): TxPlanResult => {
  const inputs: _Input[] = []
  const {outputs, certificates, withdrawals} = prepareTxPlanDraft(txPlanArgs)
  const change: _Output = {
    isChange: false,
    address: changeAddress,
    coins: 0 as Lovelace,
    tokens: [],
  }

  // TODO: refactor this when implementing multi assets
  for (const utxo of utxos) {
    inputs.push(utxo)
    try {
      const plan = computeTxPlan(inputs, outputs, change, certificates, withdrawals)
      validateTxPlan(plan)
      return {
        type: TxPlanResultType.SUCCESS,
        txPlan: plan,
      }
    } catch (e) {
      if (inputs.length === utxos.length) {
        return {
          type: TxPlanResultType.FAILURE,
          estimatedFee: computeRequiredTxFee(inputs, outputs, certificates, withdrawals),
          error: {code: e.name},
        }
      }
    }
  }
  return {
    type: TxPlanResultType.FAILURE,
    estimatedFee: computeRequiredTxFee(inputs, outputs, certificates, withdrawals),
    error: {code: 'CannotConstructTxPlan'},
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
    certificates: unsignedTx.certificates.map((cert) => ({
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
