const printAda = require('./helpers/printAda')
const debugLog = require('./helpers/debugLog')

const translations = {
  SendAddressInvalidAddress: () => 'Invalid address',
  SendAmountIsNan: () => 'Invalid format: Amount has to be a number',
  SendAmountIsNotPositive: () => 'Invalid format: Amount has to be a positive number',
  SendAmountInsufficientFunds: ({balance}) =>
    `Insufficient funds for the transaction. Your balance is ${printAda(balance)} ADA.`,
  SendAmountCantSendMaxFunds: () =>
    'Sending funds is not possible since there is not enough balance to pay the transaction fee',
  SendAmountPrecisionLimit: () => 'Invalid format: Maximum allowed precision is 0.000001',
  SendAmountIsTooBig: () =>
    `Invalid format: Amount cannot exceed ${printAda(Number.MAX_SAFE_INTEGER)}`,
  InvalidMnemonic: () => 'Invalid mnemonic, check your mnemonic for typos and try again.',
  WalletInitializationError: ({message}) =>
    `Error during wallet initialization${message ? `:  ${message}` : ''}`,
  TransactionRejectedByNetwork: () => 'Submitting the transaction into Cardano network failed.',
  TransactionRejected: () => 'Transaction rejected while signing.',
  TrezorRejected: () => 'Operation rejected by the Trezor hardware wallet.',
  TransactionCorrupted: () => 'Transaction assembling failure.',
  TransactionNotFoundInBlockchainAfterSubmission: ({sendResponse}) =>
    `Transaction ${
      sendResponse.txHash
    } not found in blockchain after being submitted, check it later please.`,
  UnknownCryptoProvider: ({cryptoProvider}) => `Uknown crypto provider: ${cryptoProvider}`,
  NetworkError: () => 'Network connection failed. Please check your network connection.',
  Error: () => 'Unknown error, please contact support at adalite@vacuumlabs.com',
}

function getTranslation(code, params) {
  if (!translations[code]) {
    debugLog(`Translation for ${code} not found!`)
  }

  return translations[code] ? translations[code](params) : code
}

module.exports = {
  getTranslation,
}
