import printAda from './helpers/printAda'
import debugLog from './helpers/debugLog'
import {ADALITE_CONFIG} from './config'
import {Lovelace} from './state'
import {LEDGER_VERSIONS, CryptoProviderFeatures} from './wallet/constants'

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
  DelegationBalanceError: () => 'Not enough funds to pay the delegation fee.',
  DelegationFeeError: () => 'Unsuccessful delegation fee calculation.',
  RewardsBalanceTooLow: () =>
    'Rewards account balance lower than the fee required to pay for the transacion.',

  InvalidMnemonic: () => 'Invalid mnemonic, check your mnemonic for typos and try again.',
  DaedalusMnemonic: () => '',

  TransportOpenUserCancelled: ({message}) => {
    const errors = {
      'navigator.usb is undefined':
        'Your browser does not support WebUSB, use e.g. Google Chrome instead.',
    }

    return `TransportCanceledByUser: ${message}. ${errors[message] || ''}`
  },
  TransportError: ({message}) =>
    `TransportError: ${message}.If you are using a hardware wallet, please make sure you are using the latest version of the Cardano application.`,
  TransportStatusError: ({message}) => {
    const errors = {
      'Ledger device: Wrong Ledger app':
        'Please make sure that the Cardano Ledger App is opened before initiating the connection.',
      'Ledger device: Device is locked': 'Please unlock your device.',
    }
    return `TransportStatusError: ${message}. ${errors[message] || ''}`
  },
  TransportInterfaceNotAvailable: ({message}) => {
    const errors = {
      'Unable to claim interface.':
        'Please make sure that no other web page/app is interacting with your Ledger device at the same time.',
    }
    return `TransportInterfaceNotAvailable: ${message} ${errors[message] || ''}`
  },

  TransactionRejectedByNetwork: () =>
    'TransactionRejectedByNetwork: Submitting the transaction into Cardano network failed. We received this error and we will investigate the cause.Currently, there is an issue with one of the Cardano components. We will inform you when the problem is fixed. ',
  TransactionRejectedWhileSigning: ({message}) =>
    `Transaction rejected while signing${
      message
        ? `:  ${message}`
        : '.If you are using a Ledger, please make sure you are using the latest version of the Cardano application. If you are using Trezor, please make sure your Trezor firmware is updated.'
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
    `LedgerOperationError: ${message}. Please make sure you are using the latest version of the Cardano application.`,

  CoinAmountError: () => 'CoinAmountError: Unsupported amount of coins.',
  OutputTooSmall: () => 'Output amount too low. Minimum output amount is 1 ADA.',
  SendAmountTooLow: () => 'Amount too low. Minimum amount to send is 1 ADA',
  SendAmountBalanceTooLow: () => 'Minimum output amount is 1 ADA.',
  CryptoProviderError: ({message}) => `CryptoProviderError: ${message}`,
  NetworkError: () =>
    'NetworkError: Request to our servers has failed. Please check your network connection and if the problem persists, contact us.',
  ServerError: () =>
    'ServerError: Our servers are probably down. Please try again later and if the problem persists, contact us.',
  LedgerOutdatedCardanoAppError: ({message}) =>
    `LedgerOutdatedCardanoAppError: Your cardano application is running on an outdated version ${message}. Please update your cardano application to the version ${
      LEDGER_VERSIONS[CryptoProviderFeatures.MINIMAL].major
    }.${LEDGER_VERSIONS[CryptoProviderFeatures.MINIMAL].minor}.${
      LEDGER_VERSIONS[CryptoProviderFeatures.MINIMAL].patch
    } or later. See https://support.ledger.com/hc/en-us/articles/360006523674-Install-uninstall-and-update-apps for more information.`,
  LedgerWithdrawalNotSupported: ({message}) =>
    `RewardsWithdrawalNotSupported: There was a bug in Ledger Cardano app 2.0.3 that didn't allow rewards withdrawals. To withdraw rewards, you need to update your Ledger firmware and your Ledger Cardano app. You need to update to firmware version 1.6.1 for Ledger Nano S and to firmware version 1.2.4-4 for Nano X. For more information how to do this please refer to https://support.ledger.com/hc/en-us/articles/360005885733-Update-device-firmware. After your ledger firmware is updated please install the latest version of the the Ledger Cardano app. Your current version is ${message} and the required version is ${
      LEDGER_VERSIONS[CryptoProviderFeatures.WITHDRAWAL].major
    }.${LEDGER_VERSIONS[CryptoProviderFeatures.WITHDRAWAL].minor}.${
      LEDGER_VERSIONS[CryptoProviderFeatures.WITHDRAWAL].patch
    }. For more information how to do this, please refer to https://support.ledger.com/hc/en-us/articles/360006523674-Install-uninstall-and-update-apps`,
  LedgerPoolRegNotSupported: ({message}) =>
    `Pool registration is not supported on this device. Your current version is ${message} and the required version is ${
      LEDGER_VERSIONS[CryptoProviderFeatures.WITHDRAWAL].major
    }.${LEDGER_VERSIONS[CryptoProviderFeatures.WITHDRAWAL].minor}.${
      LEDGER_VERSIONS[CryptoProviderFeatures.WITHDRAWAL].patch
    }`,
  PoolRegInvalidNumCerts: () =>
    'The transaction must include exactly one certificate, being the pool registration.',
  PoolRegInvalidType: () => 'The certificate in transaction is not a pool registration.',
  PoolRegWithdrawalDetected: () => 'The transaction must not include withdrawals.',
  PoolRegInvalidFileFormat: () =>
    'Specified file is not a cli-format pool registration certificate transaction.',
  PoolRegIncorrectBufferLength: ({message}) =>
    `Given property has incorrect byte length: ${message}.`,
  PoolRegInvalidNumber: ({message}) => `Given property is not a valid number: ${message}.`,
  PoolRegDuplicateOwners: () => 'The certificate contains duplicate owner hashes.',
  PoolRegNotTheOwner: () =>
    'This HW device is not an owner of the pool stated in registration certificate.',
  PoolRegInvalidMargin: () => 'The given pool margin is not valid.',
  PoolRegInvalidRelay: () => 'Relay type is incorrect.',
  PoolRegInvalidMetadata: () =>
    'Pool metadata must be either empty or contain both url and metadata hash.',
  PoolRegNoHwWallet: () => 'Only hardware wallet users can use this feature.',
  PoolRegTxParserError: ({message}) => `Parser error: ${message}`,
}

function getTranslation(code, params = {}) {
  if (!translations[code]) {
    debugLog(`Translation for ${code} not found!`)
    return null
  }
  return translations[code](params)
}

export {getTranslation}
