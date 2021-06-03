const errorsWithHelp = new Set([
  'LedgerOperationError',
  'TxSerializationError',
  'CryptoProviderError',
  'TrezorSignTxError',
  'TrezorError',
  'DisconnectedDeviceDuringOperation',
  'TransportWebUSBGestureRequired',
  'NotFoundError',
  'NotAllowedError',
  'AbortError',
  'TransportError',
  'Error',
])

function errorHasHelp(code) {
  return errorsWithHelp.has(code)
}

export {errorHasHelp}
