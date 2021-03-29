import {ADALITE_CONFIG} from './config'
import {MainTabs} from './constants'
import {StakepoolDataProvider} from './helpers/dataProviders/types'
import {localStorageVars} from './localStorage'
import {
  AccountInfo,
  AssetFamily,
  AuthMethodType,
  Lovelace,
  PoolRegTransactionSummary,
  SendAmount,
  TransactionSummary,
  TxType,
} from './types'

export interface State {
  // general
  loading: boolean
  loadingMessage: string
  alert: any // TODO
  sendSentry: {
    event?: any
    resolve?: (shouldSend: boolean) => void
  }
  errorBannerContent: string
  shouldShowUnexpectedErrorModal: boolean
  error?: any
  activeMainTab: MainTabs
  shouldShowContactFormModal?: boolean
  shouldShowExportOption?: boolean
  conversionRates?: {data: {USD: number; EUR: number}}

  // cache
  displayWelcome: boolean
  shouldShowStakingBanner: boolean
  displayInfoModal: boolean
  seenPremiumBanner: boolean
  shouldShowWantedAddressesModal: boolean

  // login / logout
  autoLogin: boolean
  authMethod: AuthMethodType | null
  shouldShowDemoWalletWarningDialog: boolean
  logoutNotificationOpen: boolean
  walletIsLoaded: boolean
  isShelleyCompatible: any
  shouldShowNonShelleyCompatibleDialog: any
  walletLoadingError?: any
  shouldShowWalletLoadingErrorModal?: boolean
  usingHwWallet?: boolean
  shouldShowSaturatedBanner?: boolean
  mnemonicAuthForm: {
    mnemonicInputValue: string
    mnemonicInputError: {code: string}
    formIsValid: boolean
  }
  hwWalletName?: string
  isDemoWallet?: boolean
  shouldShowGenerateMnemonicDialog?: boolean
  shouldShowMnemonicInfoAlert: boolean

  // send form
  sendAddress: {
    fieldValue: string
  }
  sendAmount: SendAmount
  sendAddressValidationError?: any
  sendAmountValidationError?: any
  calculatingFee?: boolean

  // delegation form
  calculatingDelegationFee?: any
  isDelegationValid?: any
  shelleyDelegation?: {
    selectedPool?: any
    delegationFee?: any
  }
  delegationValidationError?: any
  gettingPoolInfo: boolean

  // transaction
  sendTransactionSummary: TransactionSummary
  rawTransactionOpen: boolean
  rawTransaction: string
  transactionFee?: any
  sendResponse: any // TODO
  txConfirmType: string
  txSuccessTab: string
  transactionSubmissionError?: any
  shouldShowConfirmTransactionDialog?: boolean
  shouldShowTransactionErrorModal?: boolean
  shouldShowThanksForDonation?: boolean
  waitingForHwWallet?: boolean
  keepConfirmationDialogOpen: boolean

  // router
  router: {
    pathname: string
    hash: string
  }

  // pool registration
  poolRegTransactionSummary: PoolRegTransactionSummary
  poolRegTxError?: any

  // address detail
  addressVerificationError?: boolean
  showAddressDetail?: {address: string; bip32path: string; copyOnClick: boolean}
  shouldShowAddressVerification?: boolean

  // accounts info
  accountsInfo: Array<AccountInfo>
  maxAccountIndex: number
  sourceAccountIndex: number
  activeAccountIndex: number
  targetAccountIndex: number

  shouldShowSendTransactionModal: boolean
  shouldShowDelegationModal: boolean

  currentDelegation?: {
    // TODO: probably useless
    stakePool?: any
  }
  validStakepoolDataProvider?: StakepoolDataProvider
}

const initialState: State = {
  //general
  loading: false,
  loadingMessage: '',
  alert: {
    show: false,
    type: 'success', // OPTIONS are error, warning, success
    title: 'Wrong mnemonic',
    hint: 'Hint: Ensure that your mnemonic is without mistake.',
  },
  sendSentry: {},
  errorBannerContent: '',
  shouldShowUnexpectedErrorModal: false,
  activeMainTab: MainTabs.SEND,

  // cache
  displayWelcome:
    !(window.localStorage.getItem(localStorageVars.WELCOME) === 'true') &&
    ADALITE_CONFIG.ADALITE_DEVEL_AUTO_LOGIN !== 'true',
  shouldShowStakingBanner: !(
    window.localStorage.getItem(localStorageVars.STAKING_BANNER) === 'true'
  ),
  seenPremiumBanner: window.localStorage.getItem(localStorageVars.PREMIUM_BANNER) === 'true',
  shouldShowWantedAddressesModal: false,
  displayInfoModal: !(window.localStorage.getItem(localStorageVars.INFO_MODAL) === 'true'),

  // login / logout
  autoLogin:
    ADALITE_CONFIG.ADALITE_ENV === 'local' && ADALITE_CONFIG.ADALITE_DEVEL_AUTO_LOGIN === 'true',
  authMethod: ['#trezor', '#hw-wallet'].includes(window.location.hash)
    ? AuthMethodType.HW_WALLET
    : null,
  shouldShowDemoWalletWarningDialog: false,
  logoutNotificationOpen: false,
  walletIsLoaded: false,
  isShelleyCompatible: true,
  shouldShowNonShelleyCompatibleDialog: false,
  mnemonicAuthForm: {
    mnemonicInputValue: '',
    mnemonicInputError: null,
    formIsValid: false,
  },
  shouldShowMnemonicInfoAlert: false,

  // send form
  // todo - object (sub-state) from send-ada form
  sendAddress: {fieldValue: ''},
  sendAmount: {assetFamily: AssetFamily.ADA, fieldValue: '0', coins: 0 as Lovelace},

  // delegation
  shelleyDelegation: {
    delegationFee: 0 as Lovelace,
    selectedPool: null,
  },
  gettingPoolInfo: false,

  // transaction
  sendTransactionSummary: {
    // this should be called only transactionSummary
    type: TxType.SEND_ADA,
    address: null,
    coins: 0 as Lovelace,
    token: null,
    minimalLovelaceAmount: 0 as Lovelace,
    fee: 0 as Lovelace,
    plan: null,
  },
  rawTransactionOpen: false,
  rawTransaction: '',
  transactionFee: 0,
  sendResponse: {},
  txConfirmType: '',
  txSuccessTab: '',
  keepConfirmationDialogOpen: false,

  // router
  router: {
    pathname: window.location.pathname,
    hash: window.location.hash,
  },

  // pool registration
  poolRegTransactionSummary: {
    shouldShowPoolCertSignModal: false,
    ttl: null,
    validityIntervalStart: null,
    witness: null,
    plan: null,
    txBodyType: null,
  },

  // accounts info
  accountsInfo: [
    {
      accountXpubs: {
        shelleyAccountXpub: null,
        byronAccountXpub: null,
      },
      stakingXpub: null,
      stakingAddress: null,
      balance: 0,
      tokenBalance: [],
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
  sourceAccountIndex: 0,
  activeAccountIndex: 0,
  targetAccountIndex: 0,

  shouldShowSendTransactionModal: false,
  shouldShowDelegationModal: false,
}
export type SetStateFn = (newState: Partial<State>) => void
export type GetStateFn = () => State
export type Store = {getState: GetStateFn; setState: SetStateFn}

export const getSourceAccountInfo = (state: State) => state.accountsInfo[state.sourceAccountIndex]
export const getActiveAccountInfo = (state: State) => state.accountsInfo[state.activeAccountIndex]

export {initialState}
