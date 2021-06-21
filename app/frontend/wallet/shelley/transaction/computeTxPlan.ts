import {InternalError, InternalErrorReason, UnexpectedErrorReason} from '../../../errors'
import {CertificateType, Lovelace} from '../../../types'
import {MAX_TX_OUTPUT_SIZE} from '../../constants'
import {aggregateTokenBundles, getTokenBundlesDifference} from '../../helpers/tokenFormater'
import {TxAuxiliaryData, TxCertificate, TxInput, TxOutput, TxWithdrawal} from '../../types'
import {cborizeSingleTxOutput} from '../shelley-transaction'
import {TxPlanResult} from './types'
import {
  createTokenChangeOutputs,
  computeMinUTxOLovelaceAmount,
  computeRequiredDeposit,
  computeRequiredTxFee,
} from './utils'
import {encode} from 'borc'
import {MAX_OUTPUT_TOKENS, MIN_UTXO_VALUE} from './constants'

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

  const feeWithoutChange = computeRequiredTxFee(
    inputs,
    outputs,
    certificates,
    withdrawals,
    auxiliaryData
  )

  const tokenDifference = getTokenBundlesDifference(totalInputTokens, totalOutputTokens)

  const isTokenDifferenceEmpty =
    tokenDifference.length === 0 || tokenDifference.every(({quantity}) => quantity === 0)

  // Cannot construct transaction plan, not enought tokens
  if (tokenDifference.some(({quantity}) => quantity < 0)) {
    return {
      success: false,
      minimalLovelaceAmount: additionalLovelaceAmount,
      estimatedFee: feeWithoutChange,
      deposit,
      error: {code: UnexpectedErrorReason.CannotConstructTxPlan},
    }
  }

  const remainingNoChangeLovelace = totalInput - totalOutput - feeWithoutChange

  // Cannot construct transaction plan, not enough lovelace
  if (inputs.length === 0 || remainingNoChangeLovelace < 0) {
    return {
      success: false,
      minimalLovelaceAmount: additionalLovelaceAmount,
      estimatedFee: feeWithoutChange,
      deposit,
      error: {code: UnexpectedErrorReason.CannotConstructTxPlan},
    }
  }

  // No change necessary, perfect fit
  if (isTokenDifferenceEmpty && remainingNoChangeLovelace === 0) {
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
    coins: 0 as Lovelace,
    tokenBundle: [],
  }

  const feeWithAdaOnlyChange = computeRequiredTxFee(
    inputs,
    [...outputs, adaOnlyChangeOutput],
    certificates,
    withdrawals,
    auxiliaryData
  )

  const remainingAdaOnlyChangeLovelace = (totalInput -
    totalOutput -
    feeWithAdaOnlyChange) as Lovelace

  // We cannot create a change output with minimal ada so we add it to the fee
  if (isTokenDifferenceEmpty && remainingAdaOnlyChangeLovelace < MIN_UTXO_VALUE) {
    return {
      success: true,
      txPlan: {
        inputs,
        outputs,
        change: [],
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
    (acc, {coins}) => acc + coins,
    0
  ) as Lovelace

  const remainingTokenChangeLovelace = (totalInput -
    totalOutput -
    minimalTokenChangeLovelace -
    feeWithTokenChange) as Lovelace

  // remainingTokenChangeLovelace has to be positive,
  // otherwise not enough funds to pay for change outputs
  if (remainingTokenChangeLovelace < 0) {
    return {
      success: false,
      minimalLovelaceAmount: additionalLovelaceAmount,
      estimatedFee: feeWithTokenChange,
      deposit,
      error: {code: UnexpectedErrorReason.CannotConstructTxPlan},
    }
  }

  // if remainingTokenChangeLovelace is positive, we try to put it in ada only change output
  if (remainingTokenChangeLovelace > MIN_UTXO_VALUE) {
    const feeWithAdaAndTokenChange = computeRequiredTxFee(
      inputs,
      [...outputs, ...tokenChangeOutputs, adaOnlyChangeOutput],
      certificates,
      withdrawals,
      auxiliaryData
    )

    const adaOnlyChangeOutputLovelace = (remainingTokenChangeLovelace -
      (feeWithAdaAndTokenChange - feeWithTokenChange)) as Lovelace

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
    coins: (tokenChangeOutputs[0].coins + remainingTokenChangeLovelace) as Lovelace,
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
    outputsWithChange.some(({coins, tokenBundle}) => {
      coins > Number.MAX_SAFE_INTEGER ||
        tokenBundle.some(({quantity}) => quantity > Number.MAX_SAFE_INTEGER)
    })
  ) {
    throw new InternalError(InternalErrorReason.CoinAmountError)
  }

  // we cant build the transaction with big enough change lovelace
  if (change.some(({coins, tokenBundle}) => coins < computeMinUTxOLovelaceAmount(tokenBundle))) {
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
