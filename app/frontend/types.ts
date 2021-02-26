import {_SignedTx, _TxAux} from './wallet/shelley/types'
import {CaTxEntry, NextRewardDetail, RewardType, TokenObject} from './wallet/backend-types'
import {Network} from './wallet/types'

export type BIP32Path = number[]

export type _Address = string & {__typeAddress: any}

export type AddressProvider = (
  i: number
) => Promise<{
  path: BIP32Path
  address: _Address
}>

export type AddressWithMeta = {
  address: _Address
  bip32StringPath: string
  isUsed: boolean
}

export type AddressToPathMapping = {
  [key: string]: BIP32Path
}

export type AddressToPathMapper = (address: _Address) => BIP32Path

export interface CryptoProvider {
  network: Network
  signTx: (unsignedTx: _TxAux, addressToPathMapper: AddressToPathMapper) => Promise<_SignedTx>
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
}

export const enum CertificateType {
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
}
export type DerivationScheme = {
  type: 'v1' | 'v2'
  ed25519Mode: number
  keyfileVersion: string
}

export type Token = Omit<TokenObject, 'quantity'> & {
  quantity: number
}

export type HexString = string
export type TxSummaryEntry = Omit<CaTxEntry, 'fee'> & {
  fee: Lovelace
  effect: Lovelace
  tokenEffects: Token[]
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
  stakingAddress: _Address
  balance: number
  tokenBalance: Token[]
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
}

export enum StakingHistoryItemType {
  STAKE_DELEGATION,
  STAKING_REWARD,
  REWARD_WITHDRAWAL,
  STAKING_KEY_REGISTRATION,
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
  validationError?: any
}

export type SendAdaTxPlanArgs = {
  txType: TxType.SEND_ADA
  address: _Address
  sendAmount: SendAmount
}

export type ConvertLegacyAdaTxPlanArgs = {
  txType: TxType.CONVERT_LEGACY
  address: _Address
  sendAmount: SendAmount
}

export type WithdrawRewardsTxPlanArgs = {
  txType: TxType.WITHDRAW
  rewards: Lovelace
  stakingAddress: _Address
}

export type DelegateAdaTxPlanArgs = {
  txType: TxType.DELEGATE
  poolHash: string
  isStakingKeyRegistered: boolean
  stakingAddress: _Address
}

export type TxPlanArgs =
  | SendAdaTxPlanArgs
  | ConvertLegacyAdaTxPlanArgs
  | WithdrawRewardsTxPlanArgs
  | DelegateAdaTxPlanArgs

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
  tokens: Token[]
}

export const enum AssetType {
  ADA,
  TOKEN,
}

export type SendAmount =
  | {
      assetType: AssetType.ADA
      fieldValue: string
      coins: Lovelace
    }
  | {
      assetType: AssetType.TOKEN
      fieldValue: string
      token: Token
    }
