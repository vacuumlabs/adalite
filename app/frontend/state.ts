import {ADALITE_CONFIG} from './config'
import {MainTabs} from './constants'
import {InternalErrorReason} from './errors'
import {StakepoolDataProvider} from './helpers/dataProviders/types'
import {localStorageVars} from './localStorage'
import {
  AccountInfo,
  AssetFamily,
  AuthMethodType,
  Lovelace,
  PoolRegTransactionSummary,
  SendAmount,
  Stakepool,
  TransactionSummary,
  CachedTransactionSummaries,
  TxType,
  WalletOperationStatusType,
  RegisteredTokenMetadata,
  TokenRegistrySubject,
  ConversionRates,
} from './types'

export interface State {
  // general
  walletOperationStatusType: WalletOperationStatusType
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
  conversionRates?: ConversionRates

  // cache
  displayWelcome: boolean
  shouldShowStakingBanner: boolean
  displayInfoModal: boolean
  seenPremiumBanner: boolean
  shouldShowWantedAddressesModal: boolean

  // login / logout
  autoLogin: boolean
  authMethod: AuthMethodType | null
  logoutNotificationOpen: boolean
  walletIsLoaded: boolean
  isShelleyCompatible: any
  shouldShowNonShelleyCompatibleDialog: any
  walletLoadingError?: any
  shouldShowWalletLoadingErrorModal?: boolean
  shouldShowSaturatedBanner?: boolean
  mnemonicAuthForm: {
    mnemonicInputValue: string
    mnemonicInputError: {code: InternalErrorReason}
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
  shelleyDelegation?: {
    selectedPool?: Stakepool
    delegationFee?: Lovelace
  }
  delegationValidationError?: any
  gettingPoolInfo: boolean

  // transaction
  sendTransactionSummary: TransactionSummary
  cachedTransactionSummaries: CachedTransactionSummaries
  rawTransactionOpen: boolean
  rawTransaction: string
  transactionFee?: any
  txConfirmType?: TxType
  isCrossAccount: boolean
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
  tokensMetadata: Map<TokenRegistrySubject, RegisteredTokenMetadata>

  shouldShowSendTransactionModal: boolean
  shouldShowDelegationModal: boolean
  shouldShowVotingDialog: boolean

  validStakepoolDataProvider?: StakepoolDataProvider
}

const initialState: State = {
  //general
  walletOperationStatusType: null,
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
  cachedTransactionSummaries: {},
  rawTransactionOpen: false,
  rawTransaction: '',
  transactionFee: 0,
  isCrossAccount: false,
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
        isInRecommendedPoolSet: false,
        isInPrivatePoolSet: false,
        isRecommendationPrivate: false,
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
  tokensMetadata: new Map(),

  shouldShowSendTransactionModal: false,
  shouldShowDelegationModal: false,
  shouldShowVotingDialog: false,
}
export type SetStateFn = (newState: Partial<State>) => void
export type GetStateFn = () => State
export type Store = {getState: GetStateFn; setState: SetStateFn}

export const getSourceAccountInfo = (state: State) => state.accountsInfo[state.sourceAccountIndex]
export const getActiveAccountInfo = (state: State) => state.accountsInfo[state.activeAccountIndex]

export {initialState}
