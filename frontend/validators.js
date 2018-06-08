const Cardano = require('../wallet/cardano-wallet')

const parseCoins = (str) => Math.trunc(parseFloat(str) * 1000000)

const sendAddressValidator = ({fieldValue}) => ({
  fieldValue,
  validationError: !Cardano.isValidAddress(fieldValue) ? {code: 'SendAddressInvalidAddress'} : null,
})

const sendAmountValidator = ({fieldValue}) => {
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

  return {fieldValue, coins, validationError}
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

module.exports = {
  sendAddressValidator,
  sendAmountValidator,
  feeValidator,
}
