const printAda = require('./printAda')

module.exports = {
  SendAddressInvalidAddress: () => 'Invalid address',
  SendAmountIsNan: () => 'Invalid format: Amount has to be a number',
  SendAmountIsNotPositive: () => 'Invalid format: Amount has to be a positive number',
  SendAmountInsufficientFunds: ({balance}) =>
    `Insufficient funds for the transaction. Your balance is ${printAda(balance)} ADA.`,
  SendAmountPrecisionLimit: () => 'Invalid format: Maximum allowed precision is 0.000001',
  SendAmountIsTooBig: () =>
    `Invalid format: Amount cannot exceed ${printAda(Number.MAX_SAFE_INTEGER)}`,
  InvalidMnemonic: () => 'Invalid mnemonic, check your mnemonic for typos and try again.',
  WalletInitializationError: () => 'Error during wallet initialization',
  TransactionRejectedByNetwork: () =>
    'Submitting the transaction into a Cardano network failed. Check your network connection.',
  TransactionRejectedByTrezor: () => 'Transaction rejected by the Trezor hardware wallet.',
  TrezorRejected: () => 'Operation rejected by the Trezor hardware wallet.',
  TransactionCorrupted: () => 'Transaction assembling failure.',
  UnknownCryptoProvider: ({cryptoProvider}) => `Uknown crypto provider: ${cryptoProvider}`,
}
