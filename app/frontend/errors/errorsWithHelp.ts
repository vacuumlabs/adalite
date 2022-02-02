import {ErrorHelpType} from '../types'

const troubleshootAndContactErrors = new Set([
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

const troubleshootErrors = new Set(['TransactionRejectedByNetwork'])

function getErrorHelpType(code): ErrorHelpType | null {
  if (troubleshootAndContactErrors.has(code)) {
    return 'troubleshoot_and_contact'
  } else if (troubleshootErrors.has(code)) {
    return 'troubleshoot'
  }

  return null
}

export {getErrorHelpType}
