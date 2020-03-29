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
}

export interface State {
  loading: boolean
  loadingMessage: string
  alert: any // TODO
  displayWelcome: boolean
  currentTab: 'wallet-info'
  walletIsLoaded: boolean
  showStakingBanner: boolean
  visibleAddresses: Array<any> // TODO
  sendAddress: any // TODO
  sendAmount: any // TODO

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

  authMethod: AuthMethodEnum
  showDemoWalletWarningDialog: boolean
  logoutNotificationOpen: boolean
  rawTransactionOpen: boolean
  rawTransaction: string
  showMnemonicInfoAlert: boolean
  transactionHistory: Array<Transaction>
  sendResponse: any // TODO
  checkedDonationType: string // TODO: enum
  showCustomDonationInput: boolean
  donationAmount: any // TODO
  maxDonationAmount: number
  percentageDonationValue: number
  percentageDonationText: string
  thresholdAmountReached: boolean

  showUnexpectedErrorModal: boolean
  sendSentry: {
    event?: any
    resolve?: (shouldSend: boolean) => void
  }
  autoLogin: boolean

  // TODO
  waitingForHwWallet?: boolean
  showConfirmTransactionDialog?: boolean
  showTransactionErrorModal?: boolean
  showThanksForDonation?: boolean
  showContactFormModal?: boolean

  calculatingFee?: boolean
  transactionFee?: any

  sendAmountValidationError?: any
  showExportOption?: boolean

  conversionRates?: {data: {USD: number; EUR: number}}
  balance?: number
  showGenerateMnemonicDialog?: boolean

  walletLoadingError?: any
  showWalletLoadingErrorModal?: boolean
  usingHwWallet?: boolean
  addressVerificationError?: boolean
  showAddressDetail?: {address: string; bip32path: string; copyOnClick: boolean}
  hwWalletName?: string
  isDemoWallet?: boolean
  error?: any
  showAddressVerification?: boolean

  donationAmountValidationError?: any
  sendAddressValidationError?: any
  transactionSubmissionError?: any

  // stakePools: any
  calculatingDelegationFee?: any
  isDelegationValid?: any

  shelleyBalances?: {
    stakingBalance?: number
    nonStakingBalance?: number
    rewardsAccountBalance?: number
  }
  shelleyDelegation?: {
    selectedPools?: any
    delegationFee?: any
  }
  displayStakingPage?: boolean
  currentDelegation?: {
    stakePools?: any
  }
  delegationHistory?: any
  validStakepools?: any
  ticker2Id?: any
  delegationValidationError?: any
  shelleyAccountInfo?: {
    delegation: any
    value: number
    counter: number
    last_rewards: {
      epoch: number
      reward: number
    }
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
  showStakingBanner: !(window.localStorage.getItem('dontShowStakingBannerTestnet2') === 'true'),
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
  authMethod: ['#trezor', '#hw-wallet'].includes(window.location.hash) ? 'hw-wallet' : '',
  showDemoWalletWarningDialog: false,
  logoutNotificationOpen: false,
  rawTransactionOpen: false,
  rawTransaction: '',
  showMnemonicInfoAlert: false,
  transactionHistory: [],
  sendResponse: {},
  checkedDonationType: '',
  showCustomDonationInput: false,
  donationAmount: {fieldValue: 0, coins: 0},
  maxDonationAmount: Infinity,
  percentageDonationValue: 0,
  percentageDonationText: '0.2%', // What is this and why it isn't in config?
  thresholdAmountReached: false,

  showUnexpectedErrorModal: false,
  sendSentry: {},
  autoLogin:
    ADALITE_CONFIG.ADALITE_ENV === 'local' && ADALITE_CONFIG.ADALITE_DEVEL_AUTO_LOGIN === 'true',

  // shelley
  displayStakingPage: ADALITE_CONFIG.ADALITE_CARDANO_VERSION === 'shelley',
  shelleyDelegation: {
    selectedPools: [],
    delegationFee: 0.0,
  },
  shelleyBalances: {
    nonStakingBalance: 0,
    stakingBalance: 0,
    rewardsAccountBalance: 0,
  },
  shelleyAccountInfo: {
    delegation: [],
    value: 0,
    counter: 0,
    last_rewards: {
      epoch: 0,
      reward: 0,
    },
  },
  txConfirmType: '',
  txSuccessTab: '',
}

export {initialState}
