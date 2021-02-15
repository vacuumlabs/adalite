import {StakingHistoryObject} from './components/pages/delegations/stakingHistoryPage'
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

export interface CryptoProvider {
  network: Network
  signTx: (
    unsignedTx: any,
    rawInputTxs: any,
    addressToAbsPathMapper: any
  ) => Promise<{txHash: HexString; txBody: HexString}>
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

type Coins = {getCoin: string}
type Input = [_Address, Coins]
type Output = [_Address, Coins]

export type HexString = string
export type Transaction = {
  ctbId: HexString
  ctbTimeIssued: number
  ctbInputs: Array<Input>
  ctbOutputs: Array<Output>
  ctbInputSum: Coins
  ctbOutputSum: Coins
  fee: Lovelace
  effect: Lovelace
}

export type _XPubKey = {
  path: number[]
  xpubHex: HexString
}

export type AuthMethod = '' | 'hw-wallet' | 'mnemonic' // TODO
export type Ada = number & {__typeAda: any}
export type Lovelace = number & {__typeLovelace: any}

export type AccountInfo = {
  // TODO: refactor, update type
  accountXpubs: {
    shelleyAccountXpub: _XPubKey
    byronAccountXpub: _XPubKey
  }
  stakingXpub: _XPubKey
  stakingAddress: _Address
  balance: number
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
  transactionHistory: Array<Transaction>
  stakingHistory: Array<StakingHistoryObject>
  visibleAddresses: Array<any>
  poolRecommendation: {
    isInRecommendedPoolSet: boolean
    recommendedPoolHash: string
    status: string
    shouldShowSaturatedBanner: boolean
  }
  isUsed: boolean
  accountIndex: number
}

export const enum TxType {
  SEND_ADA,
  CONVERT_LEGACY,
  DELEGATE,
  WITHDRAW,
}
