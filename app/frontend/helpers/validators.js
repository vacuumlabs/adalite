const {isValidAddress} = require('cardano-crypto.js')

const {validateMnemonic} = require('../wallet/mnemonic')

const parseCoins = (str) => Math.trunc(parseFloat(str) * 1000000)

const sendAddressValidator = (fieldValue) => {
  return !isValidAddress(fieldValue) && fieldValue !== ''
    ? {code: 'SendAddressInvalidAddress'}
    : null
}

const sendAmountValidator = (fieldValue, coins) => {
  const floatRegex = /^[+-]?([0-9]+([.][0-9]*)?|[.][0-9]+)$/
  const maxAmount = Number.MAX_SAFE_INTEGER

  if (fieldValue === '') {
    return null
  }
  if (coins === null) {
    return {code: 'SendAmountCantSendMaxFunds'}
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
  if (transactionFee >= balance) {
    return {code: 'SendAmountCantSendMaxFunds'}
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

module.exports = {
  parseCoins,
  sendAddressValidator,
  sendAmountValidator,
  feeValidator,
  mnemonicValidator,
}
