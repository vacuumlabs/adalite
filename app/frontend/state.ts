import {ADALITE_CONFIG} from './config'
import {MainTabs} from './constants'
import {localStorageVars} from './localStorage'
import {AccountInfo, AuthMethod, Lovelace} from './types'
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

  authMethod: AuthMethod
  shouldShowDemoWalletWarningDialog: boolean
  logoutNotificationOpen: boolean
  rawTransactionOpen: boolean
  rawTransaction: string
  shouldShowMnemonicInfoAlert: boolean
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
  poolCertTxVars: {
    shouldShowPoolCertSignModal: boolean
    ttl: any
    signature: any
    plan: any
  }

  calculatingFee?: boolean
  transactionFee?: any

  sendAmountValidationError?: any
  shouldShowExportOption?: boolean

  conversionRates?: {data: {USD: number; EUR: number}}
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

  shelleyDelegation?: {
    selectedPool?: any
    delegationFee?: any
  }
  activeMainTab: MainTabs
  currentDelegation?: {
    stakePool?: any
  }
  validStakepools?: any | null
  ticker2Id?: any | null
  delegationValidationError?: any
  gettingPoolInfo: boolean
  txConfirmType: string
  txSuccessTab: string
  shouldShowSaturatedBanner?: boolean
  isBigDelegator: boolean
  accountsInfo: Array<AccountInfo>
  maxAccountIndex: number
  shouldNumberAccountsFromOne: boolean
  sourceAccountIndex: number
  activeAccountIndex: number
  targetAccountIndex: number
  totalWalletBalance: number
  totalRewardsBalance: number
  shouldShowSendTransactionModal: boolean
  shouldShowDelegationModal: boolean
  sendTransactionTitle: string
  delegationTitle: string
  poolRegTxError?: any
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
    !(window.localStorage.getItem(localStorageVars.WELCOME) === 'true') &&
    ADALITE_CONFIG.ADALITE_DEVEL_AUTO_LOGIN !== 'true',
  currentTab: 'wallet-info',
  walletIsLoaded: false,
  shouldShowStakingBanner: !(
    window.localStorage.getItem(localStorageVars.STAKING_BANNER) === 'true'
  ),
  shouldShowPremiumBanner: !(
    window.localStorage.getItem(localStorageVars.PREMIUM_BANNER) === 'true'
  ),
  displayInfoModal: !(window.localStorage.getItem(localStorageVars.INFO_MODAL) === 'true'),
  errorBannerContent: '',
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
  activeMainTab: MainTabs.SENDING,
  shelleyDelegation: {
    delegationFee: 0.0,
    selectedPool: {
      poolHash: '',
    },
  },
  gettingPoolInfo: false,
  txConfirmType: '',
  txSuccessTab: '',
  keepConfirmationDialogOpen: false,
  isBigDelegator: false,
  accountsInfo: [
    {
      accountXpubs: {
        shelleyAccountXpub: null,
        byronAccountXpub: null,
      },
      stakingXpub: null,
      stakingAddress: null,
      balance: 0,
      shelleyBalances: {
        stakingBalance: 0,
        nonStakingBalance: 0,
        rewardsAccountBalance: 0,
      },
      shelleyAccountInfo: {
        accountPubkeyHex: '',
        shelleyXpub: '',
        byronXpub: '',
        stakingKey: null,
        stakingAccountAddress: '',
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
      transactionHistory: [],
      stakingHistory: [],
      visibleAddresses: [],
      poolRecommendation: {
        isInRecommendedPoolSet: true,
        recommendedPoolHash: '',
        status: '',
        shouldShowSaturatedBanner: false,
      },
      isUsed: false,
      accountIndex: 0,
    },
  ],
  maxAccountIndex: 0,
  shouldNumberAccountsFromOne: false,
  sourceAccountIndex: 0,
  activeAccountIndex: 0,
  targetAccountIndex: 0,
  totalWalletBalance: 0,
  totalRewardsBalance: 0,
  shouldShowSendTransactionModal: false,
  shouldShowDelegationModal: false,
  sendTransactionTitle: '',
  delegationTitle: '',
  poolCertTxVars: {
    shouldShowPoolCertSignModal: false,
    ttl: 0,
    signature: null,
    plan: null,
  },
}
export type SetStateFn = (newState: Partial<State>) => void
export type GetStateFn = () => State

export const getSourceAccountInfo = (state: State) => state.accountsInfo[state.sourceAccountIndex]
export const getActiveAccountInfo = (state: State) => state.accountsInfo[state.activeAccountIndex]

export {initialState}
