module.exports = {
  SendAddressInvalidAddress: () => 'Invalid address',
  SendAmountIsNan: () => 'Invalid format: Amount has to be a number',
  SendAmountIsNotPositive: () => 'Invalid format: Amount has to be a positive number',
  SendAmountInsufficientFunds: ({balance}) =>
    `Insufficient funds for the transaction. Your balance is ${balance / 1000000} ADA.`,
  SendAmountPrecisionLimit: () => 'Invalid format: Maximum allowed precision is 0.000001',
}
