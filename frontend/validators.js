const Cardano = require('../wallet/cardano-wallet')

const sendAddressValidator = (sendAddresFieldValue) =>
  !Cardano.isValidAddress(sendAddresFieldValue)
    ? {
      code: 'SendAddressInvalidAddress',
    }
    : null

const sendAmountValidator = (sendAmountFieldValue) => {
  let validationError = null

  const amount = parseFloat(sendAmountFieldValue)

  const floatRegex = /^[+-]?([0-9]+([.][0-9]*)?|[.][0-9]+)$/
  const maxAmount = Number.MAX_SAFE_INTEGER

  if (!floatRegex.test(sendAmountFieldValue) || isNaN(amount)) {
    validationError = {code: 'SendAmountIsNan'}
  } else if (
    sendAmountFieldValue.split('.').length === 2 &&
    sendAmountFieldValue.split('.')[1].length > 6
  ) {
    validationError = {code: 'SendAmountPrecisionLimit'}
  } else if (parseInt(amount, 10) * 1000000 > maxAmount) {
    validationError = {code: 'SendAmountIsTooBig'}
  } else if (amount <= 0) {
    validationError = {code: 'SendAmountIsNotPositive'}
  }

  return validationError
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
