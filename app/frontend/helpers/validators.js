const {isValidAddress} = require('cardano-crypto.js')
const {ADALITE_MIN_DONATION_VALUE} = require('../config').ADALITE_CONFIG
const {toCoins} = require('../helpers/adaConverters')
const {validateMnemonic} = require('../wallet/mnemonic')

const parseCoins = (str) => Math.trunc(toCoins(parseFloat(str)))

const sendAddressValidator = (fieldValue) => {
  return {
    fieldValue,
    validationError: !isValidAddress(fieldValue) ? {code: 'SendAddressInvalidAddress'} : null,
  }
}

const sendAmountValidator = (fieldValue) => {
  let validationError = null
  const coins = parseCoins(fieldValue)

  const floatRegex = /^[+-]?([0-9]+([.][0-9]*)?|[.][0-9]+)$/
  const maxAmount = Number.MAX_SAFE_INTEGER

  if (!floatRegex.test(fieldValue) || isNaN(coins)) {
    validationError = {code: 'SendAmountIsNan'}
  } else if (fieldValue.split('.').length === 2 && fieldValue.split('.')[1].length > 6) {
    validationError = {code: 'SendAmountPrecisionLimit'}
  } else if (coins > maxAmount) {
    validationError = {code: 'SendAmountIsTooBig'}
  } else if (coins <= 0) {
    validationError = {code: 'SendAmountIsNotPositive'}
  }

  return {
    fieldValue,
    coins: isNaN(coins) ? 0 : coins,
    validationError,
  }
}

const donationAmountValidator = (fieldValue) => {
  if (fieldValue === '') {
    return {fieldValue, coins: 0, validationError: null}
  }

  const validatedObj = sendAmountValidator(fieldValue)
  const isAmountNaN =
    validatedObj.validationError && validatedObj.validationError.code === 'SendAmountIsNan'
  if (
    !isAmountNaN &&
    validatedObj.coins >= 0 &&
    validatedObj.coins < toCoins(ADALITE_MIN_DONATION_VALUE)
  ) {
    validatedObj.validationError = {code: 'DonationAmountTooLow'}
  }

  return validatedObj
}

const feeValidator = (sendAmount, transactionFee, donationAmount, balance) => {
  let validationError = null

  if (sendAmount + transactionFee + donationAmount > balance) {
    validationError = {
      code: 'DonationInsufficientBalance',
      params: {balance},
    }
  }
  if (sendAmount + transactionFee > balance) {
    validationError = {
      code: 'SendAmountInsufficientFunds',
      params: {balance},
    }
  }

  return validationError
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

module.exports = {
  sendAddressValidator,
  sendAmountValidator,
  feeValidator,
  mnemonicValidator,
  donationAmountValidator,
}
