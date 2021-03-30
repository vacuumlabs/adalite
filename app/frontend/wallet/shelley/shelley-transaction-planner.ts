import {encode} from 'borc'
import {
  cborizeSingleTxOutput,
  cborizeTxCertificates,
  cborizeTxInputs,
  cborizeTxOutputs,
  cborizeTxWithdrawals,
} from './shelley-transaction'
import {MAX_TX_OUTPUT_SIZE, MAX_TX_SIZE, TX_WITNESS_SIZES} from '../constants'
import NamedError from '../../helpers/NamedError'
import {
  Lovelace,
  CertificateType,
  TxPlanArgs,
  Address,
  TxType,
  SendAdaTxPlanArgs,
  DelegateAdaTxPlanArgs,
  WithdrawRewardsTxPlanArgs,
  ConvertLegacyAdaTxPlanArgs,
  DeregisterStakingKeyTxPlanArgs,
  AssetFamily,
  TokenBundle,
} from '../../types'
import {isShelleyFormat, isV1Address} from './helpers/addresses'
import {
  UTxO,
  TxCertificate,
  TxDelegationCert,
  TxInput,
  TxOutput,
  TxStakingKeyRegistrationCert,
  TxWithdrawal,
} from '../types'
import {aggregateTokenBundles, getTokenBundlesDifference} from '../helpers/tokenFormater'

type TxPlanDraft = {
  outputs: TxOutput[]
  certificates: TxCertificate[]
  withdrawals: TxWithdrawal[]
}

export type TxPlanResult =
  | {
      success: true
      txPlan: TxPlan
    }
  | {
      success: false
      error: any
      estimatedFee: Lovelace
      minimalLovelaceAmount: Lovelace
    }
export interface TxPlan {
  inputs: Array<TxInput>
  outputs: Array<TxOutput>
  change: TxOutput | null
  certificates: Array<TxCertificate>
  deposit: Lovelace
  additionalLovelaceAmount: Lovelace
  fee: Lovelace
  withdrawals: Array<TxWithdrawal>
}

export function txFeeFunction(txSizeInBytes: number): Lovelace {
  const a = 155381
  const b = 43.946

  return Math.ceil(a + txSizeInBytes * b) as Lovelace
}

// Estimates size of final transaction in bytes.
// Note(ppershing): can overshoot a bit
export function estimateTxSize(
  inputs: Array<TxInput>,
  outputs: Array<TxOutput>,
  certificates: Array<TxCertificate>,
  withdrawals: Array<TxWithdrawal>
): Lovelace {
  // the 1 is there for the key in the tx map
  const txInputsSize = encode(cborizeTxInputs(inputs)).length + 1
  /*
   * we have to estimate size of tx outputs since we are calculating
   * fee also in cases we dont know the amount of coins in advance
   */
  const txOutputs: TxOutput[] = outputs.map((output) => ({
    isChange: false,
    address: output.address,
    coins: Number.MAX_SAFE_INTEGER as Lovelace,
    tokenBundle: output.tokenBundle,
  }))
  // TODO: max output size
  const txOutputsSize = encode(cborizeTxOutputs(txOutputs)).length + 1

  const txCertificatesSize = encode(cborizeTxCertificates(certificates)).length + 1
  const txWithdrawalsSize = encode(cborizeTxWithdrawals(withdrawals)).length + 1
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
  inputs: Array<TxInput>,
  outputs: Array<TxOutput>,
  certificates: Array<TxCertificate> = [],
  withdrawals: Array<TxWithdrawal> = []
): Lovelace {
  const fee = txFeeFunction(estimateTxSize(inputs, outputs, certificates, withdrawals))
  return fee
}

function computeRequiredDeposit(certificates: Array<TxCertificate>): Lovelace {
  // TODO: this to network config
  const CertificateDeposit: {[key in CertificateType]: number} = {
    [CertificateType.DELEGATION]: 0,
    [CertificateType.STAKEPOOL_REGISTRATION]: 500000000,
    [CertificateType.STAKING_KEY_REGISTRATION]: 2000000,
    [CertificateType.STAKING_KEY_DEREGISTRATION]: -2000000,
  }
  return certificates.reduce((acc, {type}) => acc + CertificateDeposit[type], 0) as Lovelace
}

export const computeMinUTxOLovelaceAmount = (tokenBundle: TokenBundle): Lovelace => {
  // based on https://github.com/input-output-hk/cardano-ledger-specs/blob/master/doc/explanations/min-utxo.rst
  const quot = (x: number, y: number) => Math.floor(x / y)
  const roundupBytesToWords = (x: number) => quot(x + 7, 8)
  // TODO: this to network config or constants
  const minUTxOValue = 1000000
  // NOTE: should be 2, but a bug in Haskell set this to 0
  const coinSize = 0
  const txOutLenNoVal = 14
  const txInLen = 7
  const utxoEntrySizeWithoutVal = 6 + txOutLenNoVal + txInLen // 27

  // NOTE: should be 29 but a bug in Haskell set this to 27
  const adaOnlyUtxoSize = utxoEntrySizeWithoutVal + coinSize

  // this ensures there are only distinct (policyId, assetName) pairs
  const aggregatedTokenBundle = aggregateTokenBundles([tokenBundle])

  const distinctAssets = aggregatedTokenBundle.map(({assetName}) => assetName)

  const numAssets = distinctAssets.length
  // number of unique policyIds
  const numPIDs = aggregatedTokenBundle.map(({policyId}) => policyId).length

  const sumAssetNameLengths = distinctAssets.reduce(
    (acc, assetName) => acc + Math.max(Buffer.from(assetName, 'hex').byteLength, 1),
    0
  )

  const policyIdSize = 28 // pidSize in specs

  const size =
    6 + roundupBytesToWords(numAssets * 12 + sumAssetNameLengths + numPIDs * policyIdSize)

  if (aggregatedTokenBundle.length === 0) {
    return minUTxOValue as Lovelace
  } else {
    return Math.max(
      minUTxOValue,
      quot(minUTxOValue, adaOnlyUtxoSize) * (utxoEntrySizeWithoutVal + size)
    ) as Lovelace
  }
}

export function computeTxPlan(
  inputs: Array<TxInput>,
  outputs: Array<TxOutput>,
  possibleChange: TxOutput,
  certificates: Array<TxCertificate>,
  withdrawals: Array<TxWithdrawal>
): TxPlan {
  const totalRewards = withdrawals.reduce((acc, {rewards}) => acc + rewards, 0)
  const totalInput = inputs.reduce((acc, input) => acc + input.coins, 0) + totalRewards
  const totalInputTokens = aggregateTokenBundles(inputs.map(({tokenBundle}) => tokenBundle))
  const deposit = computeRequiredDeposit(certificates)
  const totalOutput = outputs.reduce((acc, {coins}) => acc + coins, 0) + deposit + totalRewards
  const totalOutputTokens = aggregateTokenBundles(outputs.map(({tokenBundle}) => tokenBundle))

  // total amount of lovelace that had to be added to token-containing outputs
  const additionalLovelaceAmount = outputs.reduce(
    (acc, {coins, tokenBundle}) => (tokenBundle.length > 0 ? acc + coins : acc),
    0
  ) as Lovelace

  const tokenDifference = getTokenBundlesDifference(totalInputTokens, totalOutputTokens)
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

  // Cannot construct transaction plantotalOutput
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
      additionalLovelaceAmount,
      fee: feeWithoutChange,
      withdrawals,
    }
  }

  const feeWithChange = computeRequiredTxFee(
    inputs,
    [...outputs, {...possibleChange, tokenBundle: tokenDifference}],
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
      additionalLovelaceAmount,
      fee: (totalInput - totalOutput) as Lovelace,
      withdrawals,
    }
  }

  const change: TxOutput = {
    ...possibleChange,
    tokenBundle: tokenDifference,
    coins: (totalInput - totalOutput - feeWithChange + totalRewards) as Lovelace,
  }

  const minimalChangeLovelace = computeMinUTxOLovelaceAmount(change.tokenBundle)

  // if we cannot create a change output with minimal ada we add it to the fee
  if (change.tokenBundle.length === 0 && change.coins < minimalChangeLovelace) {
    return {
      inputs,
      outputs,
      change: null,
      certificates,
      deposit,
      additionalLovelaceAmount,
      fee: (feeWithChange + change.coins) as Lovelace,
      withdrawals,
    }
  }

  // we cant build the transaction with big enough change lovelace
  if (change.tokenBundle.length > 0 && change.coins < minimalChangeLovelace) {
    throw NamedError('ChangeOutputTooSmall')
  }

  return {
    inputs,
    outputs,
    change,
    certificates,
    deposit,
    additionalLovelaceAmount,
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
  // TODO: check for maximal sizes of outputs
  if (outputs.some(({coins, tokenBundle}) => coins < computeMinUTxOLovelaceAmount(tokenBundle))) {
    throw NamedError('OutputTooSmall')
  }
  if (outputs.some((output) => encode(cborizeSingleTxOutput(output)).length > MAX_TX_OUTPUT_SIZE)) {
    throw NamedError('OutputTooBig')
  }
  const totalRewards = txPlan.withdrawals.reduce((acc, {rewards}) => acc + rewards, 0)

  // When deregistering stake key, returned "deposit" should be in all cases higher than the Tx fee
  const isDeregisteringStakeKey = txPlan.certificates.some(
    (c) => c.type === CertificateType.STAKING_KEY_DEREGISTRATION
  )
  if (!isDeregisteringStakeKey && totalRewards > 0 && totalRewards < txPlan.fee) {
    throw NamedError('RewardsBalanceTooLow')
  }
}

const prepareTxPlanDraft = (txPlanArgs: TxPlanArgs): TxPlanDraft => {
  const prepareSendAdaTx = (
    txPlanArgs: SendAdaTxPlanArgs | ConvertLegacyAdaTxPlanArgs
  ): TxPlanDraft => {
    const outputs: TxOutput[] = []
    if (txPlanArgs.sendAmount.assetFamily === AssetFamily.ADA) {
      outputs.push({
        isChange: false,
        address: txPlanArgs.address,
        coins: txPlanArgs.sendAmount.coins,
        tokenBundle: [],
      })
    } else {
      outputs.push({
        isChange: false,
        address: txPlanArgs.address,
        coins: computeMinUTxOLovelaceAmount([txPlanArgs.sendAmount.token]),
        tokenBundle: [txPlanArgs.sendAmount.token],
      })
    }

    return {
      outputs,
      certificates: [],
      withdrawals: [],
    }
  }

  const prepareDelegationTx = (txPlanArgs: DelegateAdaTxPlanArgs): TxPlanDraft => {
    const certificates: TxCertificate[] = []
    if (!txPlanArgs.isStakingKeyRegistered) {
      const registrationCertificate: TxStakingKeyRegistrationCert = {
        type: CertificateType.STAKING_KEY_REGISTRATION,
        stakingAddress: txPlanArgs.stakingAddress,
      }
      certificates.push(registrationCertificate)
    }
    if (txPlanArgs.poolHash) {
      const delegationCertificate: TxDelegationCert = {
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
    const withdrawals: TxWithdrawal[] = []
    withdrawals.push({stakingAddress: txPlanArgs.stakingAddress, rewards: txPlanArgs.rewards})
    return {
      outputs: [],
      certificates: [],
      withdrawals,
    }
  }

  const prepareDeregisterStakingKeyTx = (
    txPlanArgs: DeregisterStakingKeyTxPlanArgs
  ): TxPlanDraft => {
    const {withdrawals, outputs} = prepareWithdrawalTx({
      txType: TxType.WITHDRAW,
      rewards: txPlanArgs.rewards,
      stakingAddress: txPlanArgs.stakingAddress,
    })
    const certificates: TxCertificate[] = [
      {
        type: CertificateType.STAKING_KEY_DEREGISTRATION,
        stakingAddress: txPlanArgs.stakingAddress,
      },
    ]
    return {
      outputs,
      certificates,
      withdrawals: withdrawals.filter((w) => w.rewards > 0),
    }
  }

  switch (txPlanArgs.txType) {
    case TxType.SEND_ADA:
      return prepareSendAdaTx(txPlanArgs)
    case TxType.DELEGATE:
      return prepareDelegationTx(txPlanArgs)
    case TxType.DEREGISTER_STAKE_KEY:
      return prepareDeregisterStakingKeyTx(txPlanArgs)
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
  changeAddress: Address,
  txPlanArgs: TxPlanArgs
): TxPlanResult => {
  const inputs: TxInput[] = []
  const {outputs, certificates, withdrawals} = prepareTxPlanDraft(txPlanArgs)
  const change: TxOutput = {
    isChange: false,
    address: changeAddress,
    coins: 0 as Lovelace,
    tokenBundle: [],
  }

  // TODO: refactor this
  for (const utxo of utxos) {
    inputs.push(utxo)
    try {
      const plan = computeTxPlan(inputs, outputs, change, certificates, withdrawals)
      validateTxPlan(plan)
      return {
        success: true,
        txPlan: plan,
      }
    } catch (e) {
      if (inputs.length === utxos.length) {
        return {
          success: false,
          estimatedFee: computeRequiredTxFee(inputs, outputs, certificates, withdrawals),
          error: {code: e.name},
          minimalLovelaceAmount: outputs.reduce(
            (acc, output) =>
              output.tokenBundle.length > 0
                ? acc + computeMinUTxOLovelaceAmount(output.tokenBundle)
                : 0,
            0
          ) as Lovelace,
        }
      }
    }
  }
  return {
    success: false,
    estimatedFee: computeRequiredTxFee(inputs, outputs, certificates, withdrawals),
    error: {code: 'CannotConstructTxPlan'},
    minimalLovelaceAmount: outputs.reduce(
      (acc, output) =>
        output.tokenBundle.length > 0 ? acc + computeMinUTxOLovelaceAmount(output.tokenBundle) : 0,
      0
    ) as Lovelace,
  }
}
