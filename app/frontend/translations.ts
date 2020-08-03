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

  InvalidStakepoolIdentifier: () => 'Stakepool id is invalid.',
  RedundantStakePool: () => 'This stake pool is already chosen.',
  DelegationAccountBalanceError: () => 'Not enough funds to pay the delegation fee.',
  DelegationFeeError: () => 'Unsuccessful delegation fee calculation.',
  NonStakingConversionError: () =>
    'Insufficient balance: Not enough funds to pay the conversion fee.',

  InvalidMnemonic: () => 'Invalid mnemonic, check your mnemonic for typos and try again.',
  DaedalusMnemonic: () => '',

  TransportOpenUserCancelled: ({message}) => `TransportCanceledByUser: ${message}`,
  TransportError: ({message}) =>
    `TransportError: ${message}.If you are using a hardware wallet, please make sure your firmware is updated.`,
  TransportStatusError: ({message}) =>
    `TransportStatusError: ${message}.Please make sure your hardware wallet firmware is updated.`,

  TransactionRejectedByNetwork: () =>
    'TransactionRejectedByNetwork: Submitting the transaction into Cardano network failed.',
  TransactionRejectedWhileSigning: ({message}) =>
    `Transaction rejected while signing${
      message
        ? `:  ${message}`
        : '.If you are using a hardware wallet, please make sure your firmware is updated.'
    }`,
  TransactionCorrupted: () => 'TransactionCorrupted: Transaction assembling failure.',
  TransactionNotFoundInBlockchainAfterSubmission: ({txHash}) =>
    `TransactionNotFoundInBlockchainAfterSubmission: 
    Transaction ${txHash ||
      ''} not found in blockchain after being submitted, check it later please.`,
  TxSerializationError: ({message}) => `TxSerializationError: ${message}`,

  TrezorRejected: () => 'TrezorRejected: Operation rejected by the Trezor hardware wallet.',
  TrezorSignTxError: ({message}) => `TrezorSignTxError: ${message}`,
  TrezorError: ({message}) => `TrezorError: ${message}`,
  LedgerOperationError: ({message}) =>
    `LedgerOperationError: ${message}. Please make your sure your ledger firmware is updated.`,

  CoinAmountError: () => 'CoinAmountError: Unsupported amount of coins.',
  OutputTooSmall: () => 'Output amount too low. Minimum output amount is 1 ADA.',
  SendAmountBalanceTooLow: () => 'Minimum output amount is 1 ADA.',
  CryptoProviderError: ({message}) => `CryptoProviderError: ${message}`,
  NetworkError: () =>
    'NetworkError: Request to our servers has failed. Please check your network connection and if the problem persists, contact us.',
  ServerError: () =>
    'ServerError: Our servers are probably down. Please try again later and if the problem persists, contact us.',
}

function getTranslation(code, params = {}) {
  if (!translations[code]) {
    debugLog(`Translation for ${code} not found!`)
    return null
  }
  return translations[code](params)
}

export {getTranslation}
