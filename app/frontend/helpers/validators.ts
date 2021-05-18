import {isValidBootstrapAddress, isValidShelleyAddress} from 'cardano-crypto.js'
import {ADALITE_CONFIG} from '../config'
import {toCoins} from './adaConverters'
import {validateMnemonic} from '../wallet/mnemonic'
import {Lovelace, Ada} from '../types'
import {NETWORKS} from '../wallet/constants'
import {InternalErrorReason} from '../errors'

const {ADALITE_MIN_DONATION_VALUE} = ADALITE_CONFIG
const parseToLovelace = (str: string): Lovelace =>
  Math.trunc(toCoins(parseFloat(str) as Ada)) as Lovelace

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

const sendAmountValidator = (fieldValue: string, coins: Lovelace, balance: Lovelace) => {
  const floatRegex = /^[+-]?([0-9]+([.][0-9]*)?|[.][0-9]+)$/
  const maxAmount = Number.MAX_SAFE_INTEGER
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
  if (!floatRegex.test(fieldValue) || isNaN(coins)) {
    return {code: InternalErrorReason.SendAmountIsNan}
  }
  if (fieldValue.split('.').length === 2 && fieldValue.split('.')[1].length > 6) {
    return {code: InternalErrorReason.SendAmountPrecisionLimit}
  }
  if (coins > maxAmount) {
    return {code: InternalErrorReason.SendAmountIsTooBig}
  }
  if (coins <= 0) {
    return {code: InternalErrorReason.SendAmountIsNotPositive}
  }
  if (balance < coins) {
    return {
      code: InternalErrorReason.SendAmountInsufficientFunds,
      params: {balance},
    }
  }
  if (balance < 1000000) {
    return {code: InternalErrorReason.SendAmountBalanceTooLow}
  }
  if (coins < minAmount) {
    return {code: InternalErrorReason.SendAmountTooLow}
  }
  return null
}

const tokenAmountValidator = (fieldValue: string, quantity: number, tokenBalance: number) => {
  const maxAmount = Number.MAX_SAFE_INTEGER
  const integerRegex = /^\d+$/

  if (fieldValue === '') {
    return null
  }
  if (quantity > maxAmount) {
    return {code: InternalErrorReason.SendAmountIsTooBig}
  }
  if (quantity <= 0) {
    return {code: InternalErrorReason.SendAmountIsNotPositive}
  }
  if (!integerRegex.test(fieldValue)) {
    return {code: InternalErrorReason.TokenAmountOnlyWholeNumbers}
  }
  if (isNaN(quantity)) {
    return {code: InternalErrorReason.SendAmountIsNan}
  }
  if (quantity > tokenBalance) {
    return {
      code: InternalErrorReason.TokenAmountInsufficientFunds,
      params: {tokenBalance},
    }
  }
  return null
}

const donationAmountValidator = (fieldValue: string, coins: Lovelace, balance: Lovelace) => {
  const amountError = sendAmountValidator(fieldValue, coins, balance)
  if (amountError) {
    return amountError
  }
  if (fieldValue !== '' && coins >= 0 && coins < toCoins(ADALITE_MIN_DONATION_VALUE)) {
    return {code: InternalErrorReason.DonationAmountTooLow}
  }
  return null
}

const txPlanValidator = (
  coins: Lovelace,
  minimalLovelaceAmount: Lovelace,
  balance: Lovelace,
  fee: Lovelace,
  donationAmount: Lovelace = 0 as Lovelace
) => {
  if (minimalLovelaceAmount + fee > balance) {
    return {
      code: InternalErrorReason.SendTokenNotMinimalLovelaceAmount,
      params: {minimalLovelaceAmount},
    }
  }
  if (fee >= balance + minimalLovelaceAmount) {
    return {code: InternalErrorReason.SendAmountCantSendAnyFunds}
  }
  if (coins + fee + minimalLovelaceAmount > balance) {
    return {
      code: InternalErrorReason.SendAmountInsufficientFunds,
      params: {balance},
    }
  }
  if (donationAmount > 0 && coins + fee + donationAmount > balance) {
    return {
      code: InternalErrorReason.DonationInsufficientBalance,
      params: {balance},
    }
  }
  return null
}

const delegationPlanValidator = (balance: Lovelace, deposit: Lovelace, fee: Lovelace) => {
  if (fee + deposit > balance) {
    return {
      code: InternalErrorReason.DelegationBalanceError,
      params: {balance},
    }
  }
  const txPlanError = txPlanValidator(0 as Lovelace, 0 as Lovelace, balance, fee)
  return txPlanError || null
}

const withdrawalPlanValidator = (rewardsAmount: Lovelace, balance: Lovelace, fee: Lovelace) => {
  if (fee >= rewardsAmount) {
    return {code: InternalErrorReason.RewardsBalanceTooLow, message: ''}
  }
  const txPlanError = txPlanValidator(0 as Lovelace, 0 as Lovelace, balance, fee)
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
  sendAddressValidator,
  sendAmountValidator,
  txPlanValidator,
  delegationPlanValidator,
  withdrawalPlanValidator,
  mnemonicValidator,
  donationAmountValidator,
  tokenAmountValidator,
}
