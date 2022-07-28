import {isValidBootstrapAddress, isValidShelleyAddress} from 'cardano-crypto.js'
import {ADALITE_CONFIG} from '../config'
import {toCoins} from './adaConverters'
import {validateMnemonic} from '../wallet/mnemonic'
import {Lovelace, Ada} from '../types'
import {MAX_UINT64, NETWORKS} from '../wallet/constants'
import {InternalErrorReason} from '../errors'
import printTokenAmount from './printTokenAmount'
import BigNumber from 'bignumber.js'

const {ADALITE_MIN_DONATION_VALUE} = ADALITE_CONFIG
const parseToLovelace = (str: string): Lovelace =>
  // Math.round to solve edge cases in floating number precision like '8.131699'
  toCoins(new BigNumber(str) as Ada) as Lovelace

const parseTokenAmount = (str: string, decimals: number): BigNumber =>
  new BigNumber(str).times(new BigNumber(10).pow(decimals || 0)).integerValue(BigNumber.ROUND_FLOOR)

const sendAddressValidator = (fieldValue: string) => {
  if (fieldValue === '') {
    return null
  }
  if (fieldValue.startsWith('addr') && isValidShelleyAddress(fieldValue)) {
    return null
  }
  if (isValidBootstrapAddress(fieldValue)) {
    return null
  }
  if (fieldValue.startsWith('pool')) {
    return {code: InternalErrorReason.SendAddressPoolId}
  }
  return {code: InternalErrorReason.SendAddressInvalidAddress}
}

const sendAmountValidator = (fieldValue: string, coins: Lovelace | null, balance: Lovelace) => {
  const floatRegex = /^[+-]?([0-9]+([.][0-9]*)?|[.][0-9]+)$/
  const maxAmount = MAX_UINT64
  // TODO: we should not import NETWORK anywhere
  // we should always get it from wallet/cryptoProvider
  // and pass it as argument
  const minAmount = NETWORKS.MAINNET.minimalOutput

  if (fieldValue === '') {
    return null
  }
  if (coins === null) {
    return {code: InternalErrorReason.SendAmountCantSendAnyFunds}
  }
  if (!floatRegex.test(fieldValue) || coins.isNaN()) {
    return {code: InternalErrorReason.SendAmountIsNan}
  }
  if (fieldValue.split('.').length === 2 && fieldValue.split('.')[1].length > 6) {
    return {code: InternalErrorReason.SendAmountPrecisionLimit}
  }
  if (coins.gt(maxAmount)) {
    return {code: InternalErrorReason.SendAmountIsTooBig}
  }
  if (coins.lte(0)) {
    return {code: InternalErrorReason.SendAmountIsNotPositive}
  }
  if (balance.lt(coins)) {
    return {
      code: InternalErrorReason.SendAmountInsufficientFunds,
      params: {balance},
    }
  }
  if (balance.lt(1000000)) {
    return {code: InternalErrorReason.SendAmountBalanceTooLow}
  }
  if (coins.lt(minAmount)) {
    return {code: InternalErrorReason.SendAmountTooLow}
  }
  return null
}

const tokenAmountValidator = (
  fieldValue: string,
  quantity: BigNumber,
  tokenBalance: BigNumber,
  decimals: number = 0
) => {
  const maxAmount = MAX_UINT64
  const integerRegex = /^\d+$/
  const floatRegex = /^[+-]?([0-9]+([.][0-9]*)?|[.][0-9]+)$/

  if (fieldValue === '') {
    return null
  }
  if (quantity.gt(maxAmount)) {
    return {code: InternalErrorReason.SendAmountIsTooBig}
  }
  if (fieldValue.split('.').length === 2 && fieldValue.split('.')[1].length > decimals) {
    return {
      code: InternalErrorReason.TokenSendAmountPrecisionLimit,
      params: {decimals},
    }
  }
  if (quantity.lte(0)) {
    return {code: InternalErrorReason.SendAmountIsNotPositive}
  }
  if (!decimals && !integerRegex.test(fieldValue)) {
    return {code: InternalErrorReason.TokenAmountOnlyWholeNumbers}
  }
  if (!floatRegex.test(fieldValue) || quantity.isNaN()) {
    return {code: InternalErrorReason.SendAmountIsNan}
  }
  if (quantity.gt(tokenBalance)) {
    return {
      code: InternalErrorReason.TokenAmountInsufficientFunds,
      params: {tokenBalance: printTokenAmount(tokenBalance, decimals)},
    }
  }
  return null
}

const donationAmountValidator = (fieldValue: string, coins: Lovelace, balance: Lovelace) => {
  const amountError = sendAmountValidator(fieldValue, coins, balance)
  if (amountError) {
    return amountError
  }
  if (
    fieldValue !== '' &&
    coins.gte(0) &&
    coins < toCoins(new BigNumber(ADALITE_MIN_DONATION_VALUE) as Ada)
  ) {
    return {code: InternalErrorReason.DonationAmountTooLow}
  }
  return null
}

const txPlanValidator = (
  coins: Lovelace,
  minimalLovelaceAmount: Lovelace,
  balance: Lovelace,
  fee: Lovelace,
  donationAmount: Lovelace = new BigNumber(0) as Lovelace
) => {
  if (minimalLovelaceAmount.plus(fee).gt(balance)) {
    return {
      code: InternalErrorReason.SendTokenNotMinimalLovelaceAmount,
      params: {minimalLovelaceAmount},
    }
  }
  if (fee.gte(balance.plus(minimalLovelaceAmount))) {
    return {code: InternalErrorReason.SendAmountCantSendAnyFunds}
  }
  if (
    coins
      .plus(fee)
      .plus(minimalLovelaceAmount)
      .gt(balance)
  ) {
    return {
      code: InternalErrorReason.SendAmountInsufficientFunds,
      params: {balance},
    }
  }
  if (
    donationAmount.gt(0) &&
    coins
      .plus(fee)
      .plus(donationAmount)
      .gt(balance)
  ) {
    return {
      code: InternalErrorReason.DonationInsufficientBalance,
      params: {balance},
    }
  }
  return null
}

const delegationPlanValidator = (balance: Lovelace, deposit: Lovelace, fee: Lovelace) => {
  if (fee.plus(deposit).gt(balance)) {
    return {
      code: InternalErrorReason.DelegationBalanceError,
      params: {balance},
    }
  }
  const txPlanError = txPlanValidator(
    new BigNumber(0) as Lovelace,
    new BigNumber(0) as Lovelace,
    balance,
    fee
  )
  return txPlanError || null
}

const withdrawalPlanValidator = (rewardsAmount: Lovelace, balance: Lovelace, fee: Lovelace) => {
  if (fee.gte(rewardsAmount)) {
    return {code: InternalErrorReason.RewardsBalanceTooLow, message: ''}
  }
  const txPlanError = txPlanValidator(
    new BigNumber(0) as Lovelace,
    new BigNumber(0) as Lovelace,
    balance,
    fee
  )
  return txPlanError || null
}

const mnemonicValidator = (mnemonic) => {
  if (!validateMnemonic(mnemonic)) {
    return {
      code: InternalErrorReason.InvalidMnemonic,
    }
  }
  return null
}

export {
  parseToLovelace as parseCoins,
  parseTokenAmount,
  sendAddressValidator,
  sendAmountValidator,
  txPlanValidator,
  delegationPlanValidator,
  withdrawalPlanValidator,
  mnemonicValidator,
  donationAmountValidator,
  tokenAmountValidator,
}
