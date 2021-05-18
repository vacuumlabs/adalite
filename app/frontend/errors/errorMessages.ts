import printAda from '../helpers/printAda'
import debugLog from '../helpers/debugLog'
import {ADALITE_CONFIG} from '../config'
import {LEDGER_VERSIONS, TREZOR_VERSIONS} from '../wallet/constants'
import {Lovelace, CryptoProviderFeature} from '../types'
import {knownExternalErrors, InternalErrorReason} from '.'

const {ADALITE_MIN_DONATION_VALUE} = ADALITE_CONFIG

const ledgerTroubleshootingSuggestion =
  'If you are using Ledger, please make sure Ledger Live app is closed and try connecting your device using the "Connect with WebUSB" functionality (the button underneath "Unlock with Ledger"). For more information please read the section concerning Ledger in our troubleshooting suggestions.'
const updateHwWalletAppSuggestion =
  'If you are using a hardware wallet, please make sure you are using the latest version of the Cardano application.'

const internalErrorMessages: {[key in InternalErrorReason]: (params?: any) => string} = {
  [InternalErrorReason.SendAddressInvalidAddress]: () => 'Invalid address',
  [InternalErrorReason.SendAddressPoolId]: () =>
    'Invalid address, to stake your funds use the Staking tab',
  [InternalErrorReason.SendAmountIsNan]: () => 'Invalid format: Amount has to be a number',
  [InternalErrorReason.SendAmountIsNotPositive]: () =>
    'Invalid format: Amount has to be a positive number',
  [InternalErrorReason.SendAmountInsufficientFunds]: ({balance}) =>
    `Insufficient funds for the transaction. Your balance is ${printAda(balance)} ADA.`,
  [InternalErrorReason.SendAmountCantSendAnyFunds]: () =>
    'Sending funds is not possible since there is not enough balance to pay the transaction fee',
  [InternalErrorReason.SendAmountPrecisionLimit]: () =>
    'Invalid format: Maximum allowed precision is 0.000001',
  [InternalErrorReason.SendAmountIsTooBig]: () =>
    `Invalid format: Amount cannot exceed ${printAda(Number.MAX_SAFE_INTEGER as Lovelace)}`,
  [InternalErrorReason.TokenAmountOnlyWholeNumbers]: () =>
    'Invalid format: Asset amount has to be a whole number',
  [InternalErrorReason.TokenAmountInsufficientFunds]: ({tokenBalance}) =>
    `Insufficient funds for the transaction. Your balance is ${tokenBalance}`,
  [InternalErrorReason.SendTokenNotMinimalLovelaceAmount]: ({minimalLovelaceAmount}) =>
    `Insufficient funds for the transaction, the minimal amount of ADA for sending the tokens is ${printAda(
      minimalLovelaceAmount
    )}`,
  [InternalErrorReason.DonationAmountTooLow]: () =>
    `Minimum donation is ${ADALITE_MIN_DONATION_VALUE} ADA`,
  [InternalErrorReason.DonationInsufficientBalance]: () => 'Insufficient balance for the donation.',

  [InternalErrorReason.InvalidStakepoolIdentifier]: ({hasTickerMapping}) =>
    `Enter a valid ${hasTickerMapping ? 'ticker or ' : ''}stakepool id.`,
  [InternalErrorReason.TickerSearchDisabled]: ({hasTickerMapping}) =>
    'Search by ticker is temporary disabled',
  [InternalErrorReason.DelegationBalanceError]: () => 'Not enough funds to pay the delegation fee.',
  [InternalErrorReason.RewardsBalanceTooLow]: () =>
    'Rewards account balance lower than the fee required to pay for the transacion.',

  [InternalErrorReason.InvalidMnemonic]: () =>
    'Invalid mnemonic, check your mnemonic for typos and try again.',

  [InternalErrorReason.TransactionRejectedByNetwork]: () =>
    'TransactionRejectedByNetwork: Submitting the transaction into Cardano network failed. We received this error and we will investigate the cause.',
  [InternalErrorReason.TransactionRejectedWhileSigning]: ({message}) =>
    `Transaction rejected while signing. ${message || updateHwWalletAppSuggestion}`,
  [InternalErrorReason.TransactionNotFoundInBlockchainAfterSubmission]: ({txHash}) =>
    `TransactionNotFoundInBlockchainAfterSubmission: 
    Transaction ${txHash ||
      ''} not found in blockchain after being submitted, check it later please.`,
  [InternalErrorReason.TxSerializationError]: ({message}) => `TxSerializationError: ${message}`,

  [InternalErrorReason.TrezorSignTxError]: ({message}) => `TrezorSignTxError: ${message}`,
  [InternalErrorReason.TrezorError]: ({message}) =>
    `TrezorError: Trezor operation failed, please make sure ad blockers are switched off for this site and you are using the latest version of Trezor firmware. ${message}`,
  [InternalErrorReason.LedgerOperationError]: ({message}) =>
    `LedgerOperationError: ${message}. Please make sure you are using the latest version of the Cardano application.`,

  [InternalErrorReason.CoinAmountError]: () => 'CoinAmountError: Unsupported amount of coins.',
  [InternalErrorReason.OutputTooSmall]: () =>
    'OutputTooSmall: Not enough funds to make this transaction, try sending a different amount.',
  [InternalErrorReason.ChangeOutputTooSmall]: () =>
    'ChangeOutputTooSmall: Not enough funds to make this transaction, try sending a different amount.',
  [InternalErrorReason.TxTooBig]: () =>
    'Transaction is too big, try sending lesser amount of coins.',
  [InternalErrorReason.OutputTooBig]: () =>
    'Transaction output is too big, try sending a diffrent amount.',

  [InternalErrorReason.SendAmountTooLow]: () => 'Amount too low. Minimum amount to send is 1 ADA',
  [InternalErrorReason.SendAmountBalanceTooLow]: () => 'Minimum output amount is 1 ADA.',
  [InternalErrorReason.CryptoProviderError]: ({message}) => `CryptoProviderError: ${message}`,
  [InternalErrorReason.NetworkError]: () =>
    'NetworkError: Request to our servers has failed. Please check your network connection and if the problem persists, contact us.',
  [InternalErrorReason.ServerError]: () =>
    'ServerError: Our servers are probably down. Please try again later and if the problem persists, contact us.',
  [InternalErrorReason.EpochBoundaryUnderway]: () =>
    'Our servers are temporarily down while Cardano is undergoing an epoch boundary. We should be back in a few minutes.',
  [InternalErrorReason.LedgerMultiAssetNotSupported]: () =>
    'LedgerMultiAssetNotSupported: Sending tokens is not supported on Ledger device. Please update your cardano application to the latest version.',
  [InternalErrorReason.LedgerOutdatedCardanoAppError]: ({message}) =>
    `LedgerOutdatedCardanoAppError: Your cardano application is running on an outdated version ${message}. Please update your cardano application to the version ${
      LEDGER_VERSIONS[CryptoProviderFeature.MINIMAL].major
    }.${LEDGER_VERSIONS[CryptoProviderFeature.MINIMAL].minor}.${
      LEDGER_VERSIONS[CryptoProviderFeature.MINIMAL].patch
    } or later. See https://support.ledger.com/hc/en-us/articles/360006523674-Install-uninstall-and-update-apps for more information.`,
  [InternalErrorReason.LedgerWithdrawalNotSupported]: ({message}) =>
    `RewardsWithdrawalNotSupported: There was a bug in Ledger Cardano app 2.0.3 that didn't allow rewards withdrawals. To withdraw rewards, you need to update your Ledger firmware and your Ledger Cardano app. You need to update to firmware version 1.6.1 for Ledger Nano S and to firmware version 1.2.4-4 for Nano X. For more information how to do this please refer to https://support.ledger.com/hc/en-us/articles/360005885733-Update-device-firmware. After your ledger firmware is updated please install the latest version of the the Ledger Cardano app. Your current version is ${message} and the required version is ${
      LEDGER_VERSIONS[CryptoProviderFeature.WITHDRAWAL].major
    }.${LEDGER_VERSIONS[CryptoProviderFeature.WITHDRAWAL].minor}.${
      LEDGER_VERSIONS[CryptoProviderFeature.WITHDRAWAL].patch
    }. For more information how to do this, please refer to https://support.ledger.com/hc/en-us/articles/360006523674-Install-uninstall-and-update-apps`,
  [InternalErrorReason.LedgerPoolRegNotSupported]: ({message}) =>
    `Pool registration is not supported on this device. Your current version is ${message} and the required version is ${
      LEDGER_VERSIONS[CryptoProviderFeature.POOL_OWNER].major
    }.${LEDGER_VERSIONS[CryptoProviderFeature.POOL_OWNER].minor}.${
      LEDGER_VERSIONS[CryptoProviderFeature.POOL_OWNER].patch
    }`,
  [InternalErrorReason.LedgerBulkExportNotSupported]: () => '', // TODO
  [InternalErrorReason.TrezorPoolRegNotSupported]: ({message}) =>
    `Pool registration is not supported on this device. Your current version is ${message} and the required version is ${
      TREZOR_VERSIONS[CryptoProviderFeature.POOL_OWNER].major
    }.${TREZOR_VERSIONS[CryptoProviderFeature.POOL_OWNER].minor}.${
      TREZOR_VERSIONS[CryptoProviderFeature.POOL_OWNER].patch
    }`,
  [InternalErrorReason.TrezorMultiAssetNotSupported]: () =>
    'TrezorMultiAssetNotSupported: Sending tokens is not supported on Trezor device. Please update your firmware to the latest version.',

  [InternalErrorReason.PoolRegIncorrectBufferLength]: ({message}) =>
    `Given property has incorrect byte length: ${message}.`,
  [InternalErrorReason.PoolRegDuplicateOwners]: () =>
    'The certificate contains duplicate owner hashes.',

  [InternalErrorReason.PoolRegInvalidMargin]: () => 'The given pool margin is not valid.',
  [InternalErrorReason.PoolRegInvalidRelay]: () => 'Relay type is incorrect.',
  [InternalErrorReason.PoolRegInvalidMetadata]: () =>
    'Pool metadata must be either empty or contain both url and metadata hash.',
  [InternalErrorReason.PoolRegNoHwWallet]: () => 'Only hardware wallet users can use this feature.',
  [InternalErrorReason.PoolRegTxParserError]: ({message}) =>
    `Parser error: Invalid transaction format. ${message}`,
  [InternalErrorReason.MissingOwner]: () =>
    'This HW device is not an owner of the pool stated in registration certificate.',
  [InternalErrorReason.TransactionCorrupted]: () =>
    'TransactionCorrupted: Transaction assembling failure.',
  [InternalErrorReason.Error]: ({message}) => {
    const errors = {
      'NotFoundError: The device was disconnected.': `${message}${ledgerTroubleshootingSuggestion}`,
      'AbortError: The transfer was cancelled.': `${message}${ledgerTroubleshootingSuggestion}`,
      // an issue with CryptoToken extension allowing 2-step verification
      // https://askubuntu.com/questions/844090/what-is-cryptotokenextension-in-chromium-extensions
      "SyntaxError: Failed to execute 'postMessage' on 'Window': Invalid target origin 'chrome-extension://kmendfapggjehodndflmmgagdbamhnfd' in a call to 'postMessage'": `${message}${ledgerTroubleshootingSuggestion}`,
    }
    // we return undefined in case of unmached message on purpose since we
    // want to treat such errors as unexpected
    return errors[message]
  },
}

const externalErrorMessages: {[key: string]: (params?: any) => string} = {
  [knownExternalErrors.DeviceStatusError]: ({message}) => {
    const errors = {
      'Ledger device: Wrong Ledger app':
        'Please make sure that the Cardano Ledger App is opened before initiating the connection.',
      'Ledger device: Device is locked': 'Please unlock your device.',
    }
    return `DeviceStatusError: ${message}. ${errors[message] || ''}`
  },
  [knownExternalErrors.InvalidDataProviderInitilization]: () =>
    'Invalid data provider initilization',
  [knownExternalErrors.PoolRegNoTtl]: () =>
    'TTL parameter is missing in the transaction. It is explicitly required even for the Allegra era.',
  [knownExternalErrors.PoolRegNotTheOwner]: () =>
    'This HW device is not an owner of the pool stated in registration certificate.',
  [knownExternalErrors.PoolRegInvalidFileFormat]: () =>
    'Specified file is not a cli-format pool registration certificate transaction.',
  [knownExternalErrors.PoolRegWithdrawalDetected]: () =>
    'The transaction must not include withdrawals.',
  [knownExternalErrors.PoolRegInvalidType]: () =>
    'The certificate in transaction is not a pool registration.',
  [knownExternalErrors.PoolRegInvalidNumCerts]: () =>
    'The transaction must include exactly one certificate, being the pool registration.',
  [knownExternalErrors.TrezorRejected]: () =>
    'TrezorRejected: Operation rejected by the Trezor hardware wallet.',
  [knownExternalErrors.DaedalusMnemonic]: () => '',

  [knownExternalErrors.TransportOpenUserCancelled]: ({message}) => {
    const errors = {
      'navigator.usb is undefined':
        'Your browser does not support WebUSB, use e.g. Google Chrome instead.',
    }

    return `TransportCanceledByUser: ${message}. ${errors[message] || ''}`
  },
  [knownExternalErrors.TransportError]: ({message}) =>
    `TransportError: ${message}.If you are using a hardware wallet, please make sure you are using the latest version of the Cardano application.`,
  [knownExternalErrors.TransportStatusError]: ({message}) => {
    const errors = {
      'Failed to sign with Ledger device: U2F DEVICE_INELIGIBLE': ledgerTroubleshootingSuggestion,
    }
    return `TransportError: ${message}. ${errors[message] || updateHwWalletAppSuggestion}`
  },
  [knownExternalErrors.TransportInterfaceNotAvailable]: ({message}) => {
    const errors = {
      'Unable to claim interface.':
        'Please make sure that no other web page/app is interacting with your Ledger device at the same time.',
    }
    return `TransportInterfaceNotAvailable: ${message} ${errors[message] || ''}`
  },
  [knownExternalErrors.DisconnectedDeviceDuringOperation]: () =>
    `DisconnectedDeviceDuringOperation: ${ledgerTroubleshootingSuggestion}`,
  [knownExternalErrors.TransportWebUSBGestureRequired]: () =>
    `TransportWebUSBGestureRequired: ${ledgerTroubleshootingSuggestion}`,
  [knownExternalErrors.NotFoundError]: () => `NotFoundError: ${ledgerTroubleshootingSuggestion}`,
  [knownExternalErrors.AbortError]: () => `NotFoundError: ${ledgerTroubleshootingSuggestion}`,
  [knownExternalErrors.SecurityError]: () => `Access denied: ${ledgerTroubleshootingSuggestion}`,
  [knownExternalErrors.RedundantStakePool]: () => 'This stake pool is already chosen.',
  [knownExternalErrors.DelegationFeeError]: () => 'Unsuccessful delegation fee calculation.',
  [knownExternalErrors.DeviceVersionUnsupported]: ({message}) =>
    `DeviceVersionUnsupported: ${message}. Please make sure you are using the latest version of the Cardano application. You can do this update in Ledger Live > Manager section.  (If you dont see this update available there, please update your Ledger Live and Ledger Firmware first).`,
}

// TODO: refactor this to receive error class as argument intead of code
function getErrorMessage(code: InternalErrorReason | string, params = {}) {
  if (InternalErrorReason[code]) {
    return internalErrorMessages[code](params)
  }
  if (knownExternalErrors[code]) {
    return externalErrorMessages[code](params)
  }
  debugLog(`Error message for ${code} not found!`)
  return null
}

export {getErrorMessage}
