import {InternalErrorReason, UnexpectedErrorReason} from '../../../errors'
import {CertificateType, Lovelace} from '../../../types'
import {MAX_UINT64, MAX_TX_OUTPUT_SIZE} from '../../constants'
import {aggregateTokenBundles, getTokenBundlesDifference} from '../../helpers/tokenFormater'
import {TxCertificate, TxPlanAuxiliaryData, TxInput, TxOutput, TxWithdrawal} from '../../types'
import {cborizeSingleTxOutput} from '../shelley-transaction'
import {TxPlanResult} from './types'
import {
  createTokenChangeOutputs,
  computeMinUtxoLovelaceAmount,
  computeRequiredDeposit,
  computeRequiredTxFee,
} from './utils'
import {MAX_OUTPUT_TOKENS} from './constants'
import BigNumber from 'bignumber.js'
import {encodeCbor} from '../../helpers/cbor'

/*
  computing tx plan happens in multiple stages, first we calculate sums of inputs, outputs and
  tokenDifference, then we validate the basic condition for creating the plan, that the inputs
  are big enough to pay for the outputs, then some of the edge cases are handled, perfect fit
  and adding change to fee since it too small

  if conditions for these cases are not met, its sure the resulting tx will contain a change output
  change is either only in ada, or it contains also some tokens

  if change is only in ada, it can be added to the fee in case its too small, or is given a
  separate change output,

  if change also includes tokens, we first of all split these token into outputs so they dont
  exceed max utxo size, note that these token change outputs have minAda value which has to be
  payed for by provided inputs
  we calculate remaining change which can be of two types, its either big enough for separate
  adaOnly change output or its not and we add it to the first token change output
*/

export function computeTxPlan(
  inputs: Array<TxInput>,
  outputs: Array<TxOutput>,
  possibleChange: TxOutput,
  certificates: Array<TxCertificate>,
  withdrawals: Array<TxWithdrawal>,
  auxiliaryData: TxPlanAuxiliaryData | null
): TxPlanResult {
  const totalRewards = withdrawals.reduce((acc, {rewards}) => acc.plus(rewards), new BigNumber(0))
  const totalInput = inputs
    .reduce((acc, input) => acc.plus(input.coins), new BigNumber(0))
    .plus(totalRewards)
  const totalInputTokens = aggregateTokenBundles(inputs.map(({tokenBundle}) => tokenBundle))
  const deposit = computeRequiredDeposit(certificates)
  const totalOutput = outputs
    .reduce((acc, {coins}) => acc.plus(coins), new BigNumber(0))
    .plus(deposit)
  const totalOutputTokens = aggregateTokenBundles(outputs.map(({tokenBundle}) => tokenBundle))

  // total amount of lovelace that had to be added to token-containing outputs
  const additionalLovelaceAmount = outputs.reduce(
    (acc, {coins, tokenBundle}) => (tokenBundle.length > 0 ? acc.plus(coins) : acc),
    new BigNumber(0)
  ) as Lovelace

  const feeWithoutChange = computeRequiredTxFee(
    inputs,
    outputs,
    certificates,
    withdrawals,
    auxiliaryData
  )

  const tokenDifference = getTokenBundlesDifference(totalInputTokens, totalOutputTokens)

  const isTokenDifferenceEmpty =
    tokenDifference.length === 0 || tokenDifference.every(({quantity}) => quantity.isZero())

  // Cannot construct transaction plan, not enought tokens
  if (tokenDifference.some(({quantity}) => quantity.lt(0))) {
    return {
      success: false,
      minimalLovelaceAmount: additionalLovelaceAmount,
      estimatedFee: feeWithoutChange,
      deposit,
      error: {code: UnexpectedErrorReason.CannotConstructTxPlan},
    }
  }

  const remainingNoChangeLovelace = totalInput.minus(totalOutput).minus(feeWithoutChange)

  // Cannot construct transaction plan, not enough lovelace
  if (inputs.length === 0 || remainingNoChangeLovelace.lt(0)) {
    return {
      success: false,
      minimalLovelaceAmount: additionalLovelaceAmount,
      estimatedFee: feeWithoutChange,
      deposit,
      error: {code: UnexpectedErrorReason.CannotConstructTxPlan},
    }
  }

  // No change necessary, perfect fit
  if (isTokenDifferenceEmpty && remainingNoChangeLovelace.isZero()) {
    return {
      success: true,
      txPlan: {
        inputs,
        outputs,
        change: [],
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

  // From this point on we are sure its not a perfect fit
  // although totalOutput > totalInput so change has to be calculated

  const adaOnlyChangeOutput: TxOutput = {
    isChange: false,
    address: possibleChange.address,
    coins: new BigNumber(0) as Lovelace,
    tokenBundle: [],
  }

  const feeWithAdaOnlyChange = computeRequiredTxFee(
    inputs,
    [...outputs, adaOnlyChangeOutput],
    certificates,
    withdrawals,
    auxiliaryData
  )

  const remainingAdaOnlyChangeLovelace = totalInput
    .minus(totalOutput)
    .minus(feeWithAdaOnlyChange) as Lovelace

  // We cannot create a change output with minimal ada so we add it to the fee
  if (
    isTokenDifferenceEmpty &&
    remainingAdaOnlyChangeLovelace.lt(
      computeMinUtxoLovelaceAmount(adaOnlyChangeOutput.address, adaOnlyChangeOutput.tokenBundle)
    )
  ) {
    return {
      success: true,
      txPlan: {
        inputs,
        outputs,
        change: [],
        certificates,
        deposit,
        additionalLovelaceAmount,
        fee: totalInput.minus(totalOutput) as Lovelace,
        baseFee: feeWithoutChange,
        withdrawals,
        auxiliaryData,
      },
    }
  }

  // From this point on change has to be included in transaction for it to be balanced

  // if tokenDifference is empty, we create one ada only change output
  if (isTokenDifferenceEmpty) {
    return {
      success: true,
      txPlan: {
        inputs,
        outputs,
        change: [{...adaOnlyChangeOutput, coins: remainingAdaOnlyChangeLovelace}],
        certificates,
        deposit,
        additionalLovelaceAmount,
        fee: feeWithAdaOnlyChange as Lovelace,
        baseFee: feeWithAdaOnlyChange,
        withdrawals,
        auxiliaryData,
      },
    }
  }

  // From this point on, change includes also tokens

  const tokenChangeOutputs: TxOutput[] = createTokenChangeOutputs(
    possibleChange.address,
    tokenDifference,
    MAX_OUTPUT_TOKENS
  )

  const feeWithTokenChange = computeRequiredTxFee(
    inputs,
    [...outputs, ...tokenChangeOutputs],
    certificates,
    withdrawals,
    auxiliaryData
  )

  const minimalTokenChangeLovelace = tokenChangeOutputs.reduce(
    (acc, {coins}) => acc.plus(coins),
    new BigNumber(0)
  ) as Lovelace

  const remainingTokenChangeLovelace = totalInput
    .minus(totalOutput)
    .minus(minimalTokenChangeLovelace)
    .minus(feeWithTokenChange) as Lovelace

  // remainingTokenChangeLovelace has to be positive,
  // otherwise not enough funds to pay for change outputs
  if (remainingTokenChangeLovelace.lt(0)) {
    return {
      success: false,
      minimalLovelaceAmount: additionalLovelaceAmount,
      estimatedFee: feeWithTokenChange,
      deposit,
      error: {code: UnexpectedErrorReason.CannotConstructTxPlan},
    }
  }

  // if remainingTokenChangeLovelace is positive, we try to put it in ada only change output
  if (
    remainingTokenChangeLovelace.gt(
      computeMinUtxoLovelaceAmount(
        possibleChange.address,
        aggregateTokenBundles(tokenChangeOutputs.map((output) => output.tokenBundle))
      )
    )
  ) {
    const feeWithAdaAndTokenChange = computeRequiredTxFee(
      inputs,
      [...outputs, ...tokenChangeOutputs, adaOnlyChangeOutput],
      certificates,
      withdrawals,
      auxiliaryData
    )

    const adaOnlyChangeOutputLovelace = remainingTokenChangeLovelace.minus(
      feeWithAdaAndTokenChange.minus(feeWithTokenChange)
    ) as Lovelace

    return {
      success: true,
      txPlan: {
        inputs,
        outputs,
        change: [
          {...adaOnlyChangeOutput, coins: adaOnlyChangeOutputLovelace},
          ...tokenChangeOutputs,
        ],
        certificates,
        deposit,
        additionalLovelaceAmount,
        fee: feeWithAdaAndTokenChange,
        baseFee: feeWithAdaAndTokenChange,
        withdrawals,
        auxiliaryData,
      },
    }
  }

  // if remainingTokenChangeLovelace is too small for separate output,
  // we add the remainingTokenChangeLovelace to the first changeOutput

  const firstChangeOutput: TxOutput = {
    ...tokenChangeOutputs[0],
    coins: tokenChangeOutputs[0].coins.plus(remainingTokenChangeLovelace) as Lovelace,
  }

  return {
    success: true,
    txPlan: {
      inputs,
      outputs,
      change: tokenChangeOutputs.map((output, i) => (i === 0 ? firstChangeOutput : output)),
      certificates,
      deposit,
      additionalLovelaceAmount,
      fee: feeWithTokenChange,
      baseFee: feeWithTokenChange,
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

  const outputsWithChange = [...outputs, ...change]
  if (
    outputsWithChange.some(
      ({coins, tokenBundle}) =>
        coins.gt(MAX_UINT64) || tokenBundle.some(({quantity}) => quantity.gt(MAX_UINT64))
    )
  ) {
    return {
      ...noTxPlan,
      error: {code: InternalErrorReason.CoinAmountError},
    }
  }

  // we cant build the transaction with big enough change lovelace
  if (
    change.some(({address, coins, tokenBundle}) =>
      coins.lt(computeMinUtxoLovelaceAmount(address, tokenBundle))
    )
  ) {
    return {
      ...noTxPlan,
      error: {code: InternalErrorReason.ChangeOutputTooSmall},
    }
  }

  if (
    outputs.some(({address, coins, tokenBundle}) =>
      coins.lt(computeMinUtxoLovelaceAmount(address, tokenBundle))
    )
  ) {
    return {
      ...noTxPlan,
      error: {code: InternalErrorReason.OutputTooSmall},
    }
  }

  if (
    outputsWithChange.some(
      (output) => encodeCbor(cborizeSingleTxOutput(output)).length > MAX_TX_OUTPUT_SIZE
    )
  ) {
    return {
      ...noTxPlan,
      error: {code: InternalErrorReason.OutputTooBig},
    }
  }

  const withdrawnRewards = withdrawals.reduce(
    (acc, {rewards}) => acc.plus(rewards),
    new BigNumber(0)
  )
  const isDeregisteringStakeKey = certificates.some(
    (c) => c.type === CertificateType.STAKING_KEY_DEREGISTRATION
  )
  if (
    withdrawals.length > 0 &&
    withdrawnRewards.gte(0) &&
    (withdrawnRewards.lt(fee) || fee.gt(baseFee)) &&
    // Excluding deregistering stake key case
    // because the returned "deposit" (2 ADA) is always higher than the Tx fee
    !isDeregisteringStakeKey
  ) {
    return {
      ...noTxPlan,
      error: {code: InternalErrorReason.RewardsBalanceTooLow},
    }
  }
  return txPlanResult
}
