module.exports = {
  SendAddressInvalidAddress: () => 'Invalid address',
  SendAmountIsNan: () => 'Invalid format: Amount has to be a number',
  SenAmountIsNotPositive: () => 'Invalid format: Amount has to be a positive number',
  SendAmountInsufficientFunds: ({balance}) => `Insufficient funds. Your balance is ${balance} ADA.`,
  SendAmountInsufficientFundsForFee: ({balance, transactionFee}) => `Insufficient funds to cover the transaction fee. 
    Cannot send more than ${balance - transactionFee} ADA.`,
}
