import {isValidAddress} from 'cardano-crypto.js'
import {ADALITE_CONFIG} from '../config'
import {toCoins} from '../helpers/adaConverters'
import {validateMnemonic} from '../wallet/mnemonic'

const {ADALITE_MIN_DONATION_VALUE} = ADALITE_CONFIG
const parseCoins = (str) => Math.trunc(toCoins(parseFloat(str)))

const sendAddressValidator = (fieldValue) =>
  !isValidAddress(fieldValue) && fieldValue !== '' ? {code: 'SendAddressInvalidAddress'} : null

const sendAmountValidator = (fieldValue, coins) => {
  const floatRegex = /^[+-]?([0-9]+([.][0-9]*)?|[.][0-9]+)$/
  const maxAmount = Number.MAX_SAFE_INTEGER

  if (fieldValue === '') {
    return null
  }
  if (coins === null) {
    return {code: 'SendAmountCantSendAnyFunds'} // TODO: never used, delete
  }
  if (!floatRegex.test(fieldValue) || isNaN(coins)) {
    return {code: 'SendAmountIsNan'}
  }
  if (fieldValue.split('.').length === 2 && fieldValue.split('.')[1].length > 6) {
    return {code: 'SendAmountPrecisionLimit'}
  }
  if (coins > maxAmount) {
    return {code: 'SendAmountIsTooBig'}
  }
  if (coins <= 0) {
    return {code: 'SendAmountIsNotPositive'}
  }
  return null
}

const donationAmountValidator = (fieldValue, coins) => {
  const amountError = sendAmountValidator(fieldValue, coins)
  if (amountError) {
    return amountError
  }
  if (fieldValue !== '' && coins >= 0 && coins < toCoins(ADALITE_MIN_DONATION_VALUE)) {
    return {code: 'DonationAmountTooLow'}
  }
  return null
}

const feeValidator = (sendAmount, transactionFee, donationAmount, balance) => {
  if (transactionFee >= balance) {
    return {code: 'SendAmountCantSendAnyFunds'}
  }
  if (donationAmount > 0 && sendAmount + transactionFee + donationAmount > balance) {
    return {
      code: 'DonationInsufficientBalance',
      params: {balance},
    }
  }
  if (sendAmount + transactionFee > balance) {
    return {
      code: 'SendAmountInsufficientFunds',
      params: {balance},
    }
  }
  return null
}

const mnemonicValidator = (mnemonic) => {
  let validationError = null

  if (!validateMnemonic(mnemonic)) {
    validationError = {
      code: 'InvalidMnemonic',
    }
  }
  return validationError
}

export {
  parseCoins,
  sendAddressValidator,
  sendAmountValidator,
  feeValidator,
  mnemonicValidator,
  donationAmountValidator,
}
