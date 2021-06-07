import {InternalError, InternalErrorReason, UnexpectedErrorReason} from '../../../errors'
import {CertificateType, Lovelace} from '../../../types'
import {MAX_TX_OUTPUT_SIZE} from '../../constants'
import {aggregateTokenBundles, getTokenBundlesDifference} from '../../helpers/tokenFormater'
import {TxAuxiliaryData, TxCertificate, TxInput, TxOutput, TxWithdrawal} from '../../types'
import {cborizeSingleTxOutput} from '../shelley-transaction'
import {TxPlanResult} from './types'
import {computeMinUTxOLovelaceAmount, computeRequiredDeposit, computeRequiredTxFee} from './utils'
import {encode} from 'borc'

export function computeTxPlan(
  inputs: Array<TxInput>,
  outputs: Array<TxOutput>,
  possibleChange: TxOutput,
  certificates: Array<TxCertificate>,
  withdrawals: Array<TxWithdrawal>,
  auxiliaryData: TxAuxiliaryData
): TxPlanResult {
  const totalRewards = withdrawals.reduce((acc, {rewards}) => acc + rewards, 0)
  const totalInput = inputs.reduce((acc, input) => acc + input.coins, 0) + totalRewards
  const totalInputTokens = aggregateTokenBundles(inputs.map(({tokenBundle}) => tokenBundle))
  const deposit = computeRequiredDeposit(certificates)
  const totalOutput = outputs.reduce((acc, {coins}) => acc + coins, 0) + deposit
  const totalOutputTokens = aggregateTokenBundles(outputs.map(({tokenBundle}) => tokenBundle))

  // total amount of lovelace that had to be added to token-containing outputs
  const additionalLovelaceAmount = outputs.reduce(
    (acc, {coins, tokenBundle}) => (tokenBundle.length > 0 ? acc + coins : acc),
    0
  ) as Lovelace

  const tokenDifference = getTokenBundlesDifference(totalInputTokens, totalOutputTokens)
  // Cannot construct transaction plan, not enought tokens
  if (tokenDifference.some(({quantity}) => quantity < 0)) {
    return {
      success: false,
      minimalLovelaceAmount: additionalLovelaceAmount,
      estimatedFee: 0 as Lovelace,
      deposit,
      error: {code: UnexpectedErrorReason.CannotConstructTxPlan},
    }
  }

  const feeWithoutChange = computeRequiredTxFee(
    inputs,
    outputs,
    certificates,
    withdrawals,
    auxiliaryData
  )

  // Cannot construct transaction plan
  if (inputs.length === 0 || totalOutput + feeWithoutChange > totalInput) {
    return {
      success: false,
      minimalLovelaceAmount: additionalLovelaceAmount,
      estimatedFee: feeWithoutChange,
      deposit,
      error: {code: UnexpectedErrorReason.CannotConstructTxPlan},
    }
  }

  // No change necessary, perfect fit
  if (totalOutput + feeWithoutChange === totalInput && tokenDifference.length === 0) {
    return {
      success: true,
      txPlan: {
        inputs,
        outputs,
        change: null,
        certificates,
        deposit,
        additionalLovelaceAmount,
        fee: feeWithoutChange,
        baseFee: feeWithoutChange,
        withdrawals,
        auxiliaryData,
      },
    }
  }

  const feeWithChange = computeRequiredTxFee(
    inputs,
    [...outputs, {...possibleChange, tokenBundle: tokenDifference}],
    certificates,
    withdrawals,
    auxiliaryData
  )

  if (totalOutput + feeWithChange > totalInput && tokenDifference.length === 0) {
    // We cannot fit the change output into the transaction
    // Instead, just increase the fee
    return {
      success: true,
      txPlan: {
        inputs,
        outputs,
        change: null,
        certificates,
        deposit,
        additionalLovelaceAmount,
        fee: (totalInput - totalOutput) as Lovelace,
        baseFee: feeWithoutChange,
        withdrawals,
        auxiliaryData,
      },
    }
  }

  const change: TxOutput = {
    ...possibleChange,
    tokenBundle: tokenDifference,
    coins: (totalInput - totalOutput - feeWithChange) as Lovelace,
  }

  const minimalChangeLovelace = computeMinUTxOLovelaceAmount(change.tokenBundle)

  // if we cannot create a change output with minimal ada we add it to the fee
  if (change.tokenBundle.length === 0 && change.coins < minimalChangeLovelace) {
    return {
      success: true,
      txPlan: {
        inputs,
        outputs,
        change: null,
        certificates,
        deposit,
        additionalLovelaceAmount,
        // we need to add feeWithChange to change since the change was previously
        // computed counting with the feeWithChange
        fee: (feeWithChange + change.coins) as Lovelace,
        baseFee: feeWithoutChange,
        withdrawals,
        auxiliaryData,
      },
    }
  }

  return {
    success: true,
    txPlan: {
      inputs,
      outputs,
      change,
      certificates,
      deposit,
      additionalLovelaceAmount,
      fee: feeWithChange,
      baseFee: feeWithChange,
      withdrawals,
      auxiliaryData,
    },
  }
}

export const validateTxPlan = (txPlanResult: TxPlanResult): TxPlanResult => {
  if (txPlanResult.success === false) {
    return txPlanResult
  }
  const {txPlan} = txPlanResult
  const {
    change,
    outputs,
    withdrawals,
    fee,
    additionalLovelaceAmount,
    certificates,
    deposit,
    baseFee,
  } = txPlan

  const noTxPlan: TxPlanResult = {
    success: false,
    error: null,
    estimatedFee: fee,
    deposit,
    minimalLovelaceAmount: additionalLovelaceAmount,
  }

  const outputsWithChange = change ? [...outputs, change] : outputs
  if (
    outputsWithChange.some(({coins, tokenBundle}) => {
      coins > Number.MAX_SAFE_INTEGER ||
        tokenBundle.some(({quantity}) => quantity > Number.MAX_SAFE_INTEGER)
    })
  ) {
    throw new InternalError(InternalErrorReason.CoinAmountError)
  }

  // we cant build the transaction with big enough change lovelace
  if (change && change.coins < computeMinUTxOLovelaceAmount(change.tokenBundle)) {
    return {
      ...noTxPlan,
      error: {code: InternalErrorReason.ChangeOutputTooSmall},
    }
  }

  if (outputs.some(({coins, tokenBundle}) => coins < computeMinUTxOLovelaceAmount(tokenBundle))) {
    return {
      ...noTxPlan,
      error: {code: InternalErrorReason.OutputTooSmall},
    }
  }

  if (
    outputsWithChange.some(
      (output) => encode(cborizeSingleTxOutput(output)).length > MAX_TX_OUTPUT_SIZE
    )
  ) {
    return {
      ...noTxPlan,
      error: {code: InternalErrorReason.OutputTooBig},
    }
  }

  const totalRewards = withdrawals.reduce((acc, {rewards}) => acc + rewards, 0)
  // When deregistering stake key, returned "deposit" should be in all cases higher than the Tx fee
  const isDeregisteringStakeKey = certificates.some(
    (c) => c.type === CertificateType.STAKING_KEY_DEREGISTRATION
  )
  if (
    !isDeregisteringStakeKey &&
    ((totalRewards > 0 && totalRewards < fee) || (totalRewards > 0 && fee > baseFee))
  ) {
    return {
      ...noTxPlan,
      error: {code: InternalErrorReason.RewardsBalanceTooLow},
    }
  }
  return txPlanResult
}
