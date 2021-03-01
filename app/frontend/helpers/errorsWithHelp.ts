const errorsWithHelp = new Set([
  'LedgerOperationError',
  'TxSerializationError',
  'CryptoProviderError',
  'TrezorSignTxError',
  'TrezorError',
  'DisconnectedDeviceDuringOperation',
  'TransportWebUSBGestureRequired',
  'NotFoundError',
  'AbortError',
  'Error',
])

function errorHasHelp(code) {
  return errorsWithHelp.has(code)
}

export {errorHasHelp}
