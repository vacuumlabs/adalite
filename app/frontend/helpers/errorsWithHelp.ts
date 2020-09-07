const errorsWithHelp = new Set([
  'LedgerOperationError',
  'TxSerializationError',
  'CryptoProviderError',
  'TrezorSignTxError',
  'TrezorError',
  'TransactionRejectedByNetwork',
])

function errorHasHelp(code) {
  return errorsWithHelp.has(code)
}

export {errorHasHelp}
