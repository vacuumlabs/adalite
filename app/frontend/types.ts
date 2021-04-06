import {TxSigned, TxAux, CborizedCliWitness} from './wallet/shelley/types'
import {CaTxEntry, NextRewardDetail, RewardType, TokenObject} from './wallet/backend-types'
import {Network} from './wallet/types'
import {TxPlan} from './wallet/shelley/shelley-transaction-planner'
import {_UnsignedTxParsed} from './helpers/cliParser/types'

export type BIP32Path = number[]

export type Address = string & {__typeAddress: any}

export type AddressProvider = (
  i: number
) => Promise<{
  path: BIP32Path
  address: Address
}>

export type AddressWithMeta = {
  address: Address
  bip32StringPath: string
  isUsed: boolean
}

export type AddressToPathMapping = {
  [key: string]: BIP32Path
}

export type AddressToPathMapper = (address: Address) => BIP32Path

export interface CryptoProvider {
  network: Network
  signTx: (unsignedTx: TxAux, addressToPathMapper: AddressToPathMapper) => Promise<TxSigned>
  witnessPoolRegTx: (
    unsignedTx: TxAux,
    addressToPathMapper: AddressToPathMapper
  ) => Promise<CborizedCliWitness>
  getWalletSecret: () => Buffer | void
  getWalletName: () => string
  getDerivationScheme: () => DerivationScheme
  deriveXpub: (derivationPath: BIP32Path) => Promise<Buffer>
  isHwWallet: () => boolean
  getHdPassphrase: () => Buffer | void
  _sign: (message: HexString, absDerivationPath: BIP32Path) => void
  ensureFeatureIsSupported: (feature: CryptoProviderFeature) => void
  isFeatureSupported: (feature: CryptoProviderFeature) => boolean
  displayAddressForPath: (absDerivationPath: BIP32Path, stakingPath: BIP32Path) => void
  getVersion: () => string | null
}

// TODO: remove this and replace with TxCertificateType
export enum CertificateType {
  STAKING_KEY_REGISTRATION = 0,
  STAKING_KEY_DEREGISTRATION = 1,
  DELEGATION = 2,
  STAKEPOOL_REGISTRATION = 3,
}

export const enum CryptoProviderFeature {
  MINIMAL,
  WITHDRAWAL,
  BULK_EXPORT,
  POOL_OWNER,
  MULTI_ASSET,
}
export type DerivationScheme = {
  type: 'v1' | 'v2'
  ed25519Mode: number
  keyfileVersion: string
}

export type Token = Omit<TokenObject, 'quantity'> & {
  quantity: number
}

export type TokenBundle = Token[]

export type OrderedTokenBundle = {
  policyId: string
  assets: {
    assetName: string
    quantity: number
  }[]
}[]

export type HexString = string
export type TxSummaryEntry = Omit<CaTxEntry, 'fee'> & {
  fee: Lovelace
  effect: Lovelace
  tokenEffects: TokenBundle
}

export type _XPubKey = {
  path: number[]
  xpubHex: HexString
}

export enum AuthMethodType {
  MNEMONIC = 'mnemonic',
  HW_WALLET = 'hw-wallet',
  KEY_FILE = 'file',
}

export enum ScreenType {
  MOBILE,
  TABLET,
  DESKTOP,
}

export type Ada = number & {__typeAda: any}
export type Lovelace = number & {__typeLovelace: any}

export type PoolRecommendation = {
  isInRecommendedPoolSet: boolean
  recommendedPoolHash: string
  status: string
  shouldShowSaturatedBanner: boolean
}

export type AccountInfo = {
  // TODO: refactor, update type
  accountXpubs: {
    shelleyAccountXpub: _XPubKey
    byronAccountXpub: _XPubKey
  }
  stakingXpub: _XPubKey
  stakingAddress: Address
  balance: number
  tokenBalance: TokenBundle
  shelleyBalances: {
    stakingBalance?: number
    nonStakingBalance?: number
    rewardsAccountBalance?: number
  }
  shelleyAccountInfo: {
    accountPubkeyHex: string
    shelleyXpub: any
    byronXpub: any
    stakingKey: {path: []; pub: Buffer} | null
    stakingAccountAddress: string
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
  transactionHistory: Array<TxSummaryEntry>
  stakingHistory: Array<StakingHistoryObject>
  visibleAddresses: Array<any>
  poolRecommendation: PoolRecommendation
  isUsed: boolean
  accountIndex: number
}

export const enum TxType {
  SEND_ADA,
  CONVERT_LEGACY,
  DELEGATE,
  WITHDRAW,
  POOL_REG_OWNER,
  DEREGISTER_STAKE_KEY,
}

export enum StakingHistoryItemType {
  STAKE_DELEGATION,
  STAKING_REWARD,
  REWARD_WITHDRAWAL,
  STAKING_KEY_REGISTRATION,
  STAKING_KEY_DEREGISTRATION,
}

export interface StakingHistoryObject {
  type: StakingHistoryItemType
  epoch: number
  dateTime: Date
}

export interface StakingHistoryStakePool {
  id: string
  name: string
}

export interface StakeDelegation extends StakingHistoryObject {
  newStakePool: StakingHistoryStakePool
  oldStakePool?: StakingHistoryStakePool
  txHash: string
}

export interface StakingReward extends StakingHistoryObject {
  forEpoch: number
  reward: Lovelace
  stakePool: StakingHistoryStakePool
  rewardType: RewardType
}

export interface RewardWithdrawal extends StakingHistoryObject {
  amount: Lovelace
  txHash: string
}
export interface StakingKeyRegistration extends StakingHistoryObject {
  action: string
  stakingKey: string
  txHash: string
}

export type Stakepool = {
  pledge: string
  margin: number
  fixedCost: string
  url: string
  name: string
  ticker: string
  homepage: string
  poolHash: string
}

export type SendAdaTxPlanArgs = {
  txType: TxType.SEND_ADA
  address: Address
  sendAmount: SendAmount
}

export type ConvertLegacyAdaTxPlanArgs = {
  txType: TxType.CONVERT_LEGACY
  address: Address
  sendAmount: SendAmount
}

export type WithdrawRewardsTxPlanArgs = {
  txType: TxType.WITHDRAW
  rewards: Lovelace
  stakingAddress: Address
}

export type DelegateAdaTxPlanArgs = {
  txType: TxType.DELEGATE
  poolHash: string
  isStakingKeyRegistered: boolean
  stakingAddress: Address
}

export type PoolOwnerTxPlanArgs = {
  txType: TxType.POOL_REG_OWNER
  unsignedTxParsed: _UnsignedTxParsed
}

export type DeregisterStakingKeyTxPlanArgs = {
  txType: TxType.DEREGISTER_STAKE_KEY
  rewards: Lovelace
  stakingAddress: Address
}

export type TxPlanArgs =
  | SendAdaTxPlanArgs
  | ConvertLegacyAdaTxPlanArgs
  | WithdrawRewardsTxPlanArgs
  | DelegateAdaTxPlanArgs
  | PoolOwnerTxPlanArgs
  | DeregisterStakingKeyTxPlanArgs

export type HostedPoolMetadata = {
  name: string
  description: string
  ticker: string
  homepage: string
  extended?: string
}

export type RewardWithMetadata = NextRewardDetail & {
  distributionEpoch?: number
  pool: HostedPoolMetadata | Object // TODO after refactor
}

export type NextRewardDetailsFormatted = {
  upcoming: Array<RewardWithMetadata>
  nearest: RewardWithMetadata
  currentDelegation: RewardWithMetadata
}

export type Balance = {
  coins: Lovelace
  tokenBundle: TokenBundle
}

export const enum AssetFamily {
  ADA,
  TOKEN,
}

export type SendAmount =
  | {
      assetFamily: AssetFamily.ADA
      fieldValue: string
      coins: Lovelace
    }
  | {
      assetFamily: AssetFamily.TOKEN
      fieldValue: string
      token: Token
    }

export type SendAddress = {
  fieldValue: string
}

export type TransactionSummary = {
  type: TxType
  fee: Lovelace
  plan: TxPlan
} & (
  | SendTransactionSummary
  | WithdrawTransactionSummary
  | DelegateTransactionSummary
  | DeregisterStakingKeyTransactionSummary
)

export type SendTransactionSummary = {
  type: TxType.SEND_ADA | TxType.CONVERT_LEGACY
  coins: Lovelace
  token: Token | null
  address: Address
  minimalLovelaceAmount: Lovelace
}

export type DeregisterStakingKeyTransactionSummary = {
  type: TxType.DEREGISTER_STAKE_KEY
  deposit: Lovelace
  rewards: Lovelace
}

export type WithdrawTransactionSummary = {
  type: TxType.WITHDRAW
  rewards: Lovelace
}
export type DelegateTransactionSummary = {
  type: TxType.DELEGATE
  deposit: Lovelace
  stakePool: any // TODO:
}

export type PoolRegTransactionSummary = {
  shouldShowPoolCertSignModal: boolean
  ttl: number | null
  validityIntervalStart: number | null
  witness: CborizedCliWitness
  plan: TxPlan
  txBodyType: string
}
