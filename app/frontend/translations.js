const printAda = require('./helpers/printAda')
const debugLog = require('./helpers/debugLog')

const translations = {
  SendAddressInvalidAddress: () => 'Invalid address',
  SendAmountIsNan: () => 'Invalid format: Amount has to be a number',
  SendAmountIsNotPositive: () => 'Invalid format: Amount has to be a positive number',
  SendAmountInsufficientFunds: ({balance}) =>
    `Insufficient funds for the transaction. Your balance is ${printAda(balance)} ADA.`,
  SendAmountCantSendAnyFunds: () =>
    'Sending funds is not possible since there is not enough balance to pay the transaction fee',
  SendAmountPrecisionLimit: () => 'Invalid format: Maximum allowed precision is 0.000001',
  SendAmountIsTooBig: () =>
    `Invalid format: Amount cannot exceed ${printAda(Number.MAX_SAFE_INTEGER)}`,

  InvalidMnemonic: () => 'Invalid mnemonic, check your mnemonic for typos and try again.',

  WalletInitializationError: ({message}) =>
    `Error during wallet initialization${message ? `:  ${message}` : '.'}`,
  TransportOpenUserCancelled: ({message}) => `TransportCanceledByUser: ${message}`,
  TransportError: ({message}) => `TransportError: ${message}`,
  TransportStatusError: ({message}) => `TransportStatusError: ${message}`,

  TransactionRejectedByNetwork: () => 'Submitting the transaction into Cardano network failed.',
  TransactionRejected: ({message}) =>
    `Transaction rejected while signing${message ? `:  ${message}` : '.'}`,
  TrezorRejected: () => 'Operation rejected by the Trezor hardware wallet.',
  TransactionCorrupted: () => 'Transaction assembling failure.',
  TransactionNotFoundInBlockchainAfterSubmission: ({txHash}) =>
    `Transaction ${txHash} not found in blockchain after being submitted, check it later please.`,
  TrezorSignTxError: () => 'Signing the transaction on trezor failed.',
  LedgerOperationError: () => 'Ledger operation failed',
  TxSerializationError: () => 'Tx serialization mismatch between Ledger and Adalite',
  CoinAmountError: () => 'Unsupported amount of coins.',
  CoinFeeError: () => 'Transaction inputs do not cover coins',
  TrezorError: () =>
    'Trezor operation failed, please make sure ad blockers are switched off for this site',

  UnknownCryptoProvider: () => 'Unknown crypto provider type',
  NetworkError: () => 'Network connection failed. Please check your network connection.',
}

function getTranslation(code, params) {
  if (!translations[code]) {
    debugLog(`Translation for ${code} not found!`)
    return null
  }
  return params ? translations[code](params) : translations[code]({})
}

module.exports = {
  getTranslation,
}
