import {ADALITE_CONFIG} from './config'

interface Transaction {}

type AuthMethodEnum = '' | 'hw-wallet' | 'mnemonic' // TODO
export type Ada = number & {__typeAda: any}
export type Lovelace = number & {__typeLovelace: any}
export interface SendTransactionSummary {
  amount?: Lovelace
  donation?: Lovelace
  fee: Lovelace
  plan: any
  tab?: any
  deposit: any
}

export interface State {
  loading: boolean
  loadingMessage: string
  alert: any // TODO
  displayWelcome: boolean
  displayInfoModal: boolean
  currentTab: 'wallet-info'
  walletIsLoaded: boolean
  shouldShowStakingBanner: boolean
  errorBannerContent: string
  visibleAddresses: Array<any> // TODO
  sendAddress: any // TODO
  sendAmount: any // TODO
  keepConfirmationDialogOpen: boolean

  sendTransactionSummary: SendTransactionSummary

  router: {
    pathname: string
    hash: string
  }
  mnemonicAuthForm: {
    mnemonicInputValue: string
    mnemonicInputError: {code: string}
    formIsValid: boolean
  }

  isShelleyCompatible: any
  shouldShowNonShelleyCompatibleDialog: any

  authMethod: AuthMethodEnum
  shouldShowDemoWalletWarningDialog: boolean
  logoutNotificationOpen: boolean
  rawTransactionOpen: boolean
  rawTransaction: string
  shouldShowMnemonicInfoAlert: boolean
  transactionHistory: Array<Transaction>
  sendResponse: any // TODO
  checkedDonationType: string // TODO: enum
  shouldShowCustomDonationInput: boolean
  donationAmount: any // TODO
  maxDonationAmount: number
  percentageDonationValue: number
  percentageDonationText: string
  isThresholdAmountReached: boolean

  shouldShowUnexpectedErrorModal: boolean
  sendSentry: {
    event?: any
    resolve?: (shouldSend: boolean) => void
  }
  autoLogin: boolean

  // TODO
  waitingForHwWallet?: boolean
  shouldShowConfirmTransactionDialog?: boolean
  shouldShowTransactionErrorModal?: boolean
  shouldShowThanksForDonation?: boolean
  shouldShowContactFormModal?: boolean
  shouldShowPremiumBanner?: boolean

  calculatingFee?: boolean
  transactionFee?: any

  sendAmountValidationError?: any
  shouldShowExportOption?: boolean

  conversionRates?: {data: {USD: number; EUR: number}}
  balance?: number
  shouldShowGenerateMnemonicDialog?: boolean

  walletLoadingError?: any
  shouldShowWalletLoadingErrorModal?: boolean
  usingHwWallet?: boolean
  addressVerificationError?: boolean
  showAddressDetail?: {address: string; bip32path: string; copyOnClick: boolean}
  hwWalletName?: string
  isDemoWallet?: boolean
  error?: any
  shouldShowAddressVerification?: boolean

  donationAmountValidationError?: any
  sendAddressValidationError?: any
  transactionSubmissionError?: any

  calculatingDelegationFee?: any
  isDelegationValid?: any

  shelleyBalances?: {
    stakingBalance?: number
    nonStakingBalance?: number
    rewardsAccountBalance?: number
  }
  shelleyDelegation?: {
    selectedPool?: any
    delegationFee?: any
  }
  displayStakingPage?: boolean
  currentDelegation?: {
    stakePool?: any
  }
  stakingHistory?: any
  validStakepools?: any | null
  ticker2Id?: any | null
  delegationValidationError?: any
  gettingPoolInfo: boolean
  shelleyAccountInfo?: {
    accountPubkeyHex: string
    currentEpoch: number
    delegation: any
    hasStakingKey: boolean
    rewards: number
    rewardDetails: {
      upcoming: any
      nearest: any
      currentDelegation: any
    }
    value: number
  }
  txConfirmType: string
  txSuccessTab: string
}

const initialState: State = {
  loading: false,
  loadingMessage: '',
  alert: {
    show: false,
    type: 'success', // OPTIONS are error, warning, success
    title: 'Wrong mnemonic',
    hint: 'Hint: Ensure that your mnemonic is without mistake.',
  },
  displayWelcome:
    !(window.localStorage.getItem('dontShowDisclaimer') === 'true') &&
    ADALITE_CONFIG.ADALITE_DEVEL_AUTO_LOGIN !== 'true',
  currentTab: 'wallet-info',
  walletIsLoaded: false,
  shouldShowStakingBanner: !(
    window.localStorage.getItem('dontShowStakingBannerTestnet3') === 'true'
  ),
  shouldShowPremiumBanner: !(window.localStorage.getItem('dontShowPremiumBanner') === 'true'),
  displayInfoModal: !(window.localStorage.getItem('dontShowInfoModal') === 'true'),
  errorBannerContent: '',
  visibleAddresses: [],
  // todo - object (sub-state) from send-ada form
  sendAddress: {fieldValue: ''},
  sendAmount: {fieldValue: 0, coins: 0},
  transactionFee: 0,
  sendTransactionSummary: {
    amount: 0 as Lovelace,
    fee: 0 as Lovelace,
    donation: 0 as Lovelace,
    plan: null,
    deposit: 0,
  },
  router: {
    pathname: window.location.pathname,
    hash: window.location.hash,
  },
  mnemonicAuthForm: {
    mnemonicInputValue: '',
    mnemonicInputError: null,
    formIsValid: false,
  },
  isShelleyCompatible: true,
  shouldShowNonShelleyCompatibleDialog: false,
  authMethod: ['#trezor', '#hw-wallet'].includes(window.location.hash) ? 'hw-wallet' : '',
  shouldShowDemoWalletWarningDialog: false,
  logoutNotificationOpen: false,
  rawTransactionOpen: false,
  rawTransaction: '',
  shouldShowMnemonicInfoAlert: false,
  transactionHistory: [],
  sendResponse: {},
  checkedDonationType: '',
  shouldShowCustomDonationInput: false,
  donationAmount: {fieldValue: 0, coins: 0},
  maxDonationAmount: Infinity,
  percentageDonationValue: 0,
  percentageDonationText: '0.2%', // What is this and why it isn't in config?
  isThresholdAmountReached: false,

  shouldShowUnexpectedErrorModal: false,
  sendSentry: {},
  autoLogin:
    ADALITE_CONFIG.ADALITE_ENV === 'local' && ADALITE_CONFIG.ADALITE_DEVEL_AUTO_LOGIN === 'true',

  // shelley
  displayStakingPage: false,
  shelleyDelegation: {
    delegationFee: 0.0,
    selectedPool: {
      poolHash: '',
    },
  },
  gettingPoolInfo: false,
  shelleyBalances: {
    nonStakingBalance: 0,
    stakingBalance: 0,
    rewardsAccountBalance: 0,
  },
  shelleyAccountInfo: {
    accountPubkeyHex: '',
    currentEpoch: 0,
    delegation: {},
    hasStakingKey: false,
    rewards: 0,
    rewardDetails: {
      upcoming: null,
      nearest: null,
      currentDelegation: null,
    },
    value: 0,
  },
  txConfirmType: '',
  txSuccessTab: '',
  keepConfirmationDialogOpen: false,
}

export {initialState}
