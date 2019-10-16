const errorsWithHelp = new Set([
  'LedgerOperationError',
  'TxSerializationError',
  'CryptoProviderError',
  'TrezorSignTxError',
  'TrezorError',
])

function errorHasHelp(code) {
  return errorsWithHelp.has(code)
}

module.exports = {
  errorHasHelp,
}
