const {isValidAddress} = require('cardano-crypto.js')

const {validateMnemonic} = require('../wallet/mnemonic')

const parseCoins = (str) => Math.trunc(parseFloat(str) * 1000000)

const sendAddressValidator = (fieldValue) => {
  return !isValidAddress(fieldValue) && fieldValue !== ''
    ? {code: 'SendAddressInvalidAddress'}
    : null
}

const sendAmountValidator = (fieldValue) => {
  const coins = parseCoins(fieldValue)

  const floatRegex = /^[+-]?([0-9]+([.][0-9]*)?|[.][0-9]+)$/
  const maxAmount = Number.MAX_SAFE_INTEGER

  if (fieldValue === '') {
    return null
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

const feeValidator = (sendAmount, transactionFee, balance) => {
  let validationError = null

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
  parseCoins,
  sendAddressValidator,
  sendAmountValidator,
  feeValidator,
  mnemonicValidator,
}
