import printAda from './helpers/printAda'
import debugLog from './helpers/debugLog'
import {ADALITE_CONFIG} from './config'
import {Lovelace} from './state'

const {ADALITE_MIN_DONATION_VALUE} = ADALITE_CONFIG

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
    `Invalid format: Amount cannot exceed ${printAda(Number.MAX_SAFE_INTEGER as Lovelace)}`,
  DonationAmountTooLow: () => `Minimum donation is ${ADALITE_MIN_DONATION_VALUE} ADA`,
  DonationInsufficientBalance: () => 'Insufficient balance for the donation.',

  InvalidStakepoolIdentifier: () => 'Stakepool id or ticker is invalid.',
  RudundantStakePool: () => 'This stake pool is already chosen.',
  DelegationAccountBalanceError: () => 'Not enough funds to pay the delegation fee.',

  InvalidMnemonic: () => 'Invalid mnemonic, check your mnemonic for typos and try again.',

  TransportOpenUserCancelled: ({message}) => `TransportCanceledByUser: ${message}`,
  TransportError: ({message}) => `TransportError: ${message}`,
  TransportStatusError: ({message}) => `TransportStatusError: ${message}`,

  TransactionRejectedByNetwork: () =>
    'TransactionRejectedByNetwork: Submitting the transaction into Cardano network failed.',
  TransactionRejectedWhileSigning: ({message}) =>
    `Transaction rejected while signing${message ? `:  ${message}` : '.'}`,
  TransactionCorrupted: () => 'TransactionCorrupted: Transaction assembling failure.',
  TransactionNotFoundInBlockchainAfterSubmission: ({txHash}) =>
    `TransactionNotFoundInBlockchainAfterSubmission: 
    Transaction ${txHash ||
      ''} not found in blockchain after being submitted, check it later please.`,
  TxSerializationError: ({message}) => `TxSerializationError: ${message}`,

  TrezorRejected: () => 'TrezorRejected: Operation rejected by the Trezor hardware wallet.',
  TrezorSignTxError: ({message}) => `TrezorSignTxError: ${message}`,
  TrezorError: ({message}) => `TrezorError: ${message}`,
  LedgerOperationError: ({message}) => `LedgerOperationError: ${message}`,

  CoinAmountError: () => 'CoinAmounError: Unsupported amount of coins.',
  CryptoProviderError: ({message}) => `CryptoProviderError: ${message}`,
  NetworkError: ({message}) =>
    `NetworkError: connection failed. Please check your network connection. ${message}`,

  NodeOutOfSync: () => 'Servis is temporary unavaible, please try again in 1-2 minutes.',
}

function getTranslation(code, params = {}) {
  if (!translations[code]) {
    debugLog(`Translation for ${code} not found!`)
    return null
  }
  return translations[code](params)
}

export {getTranslation}
