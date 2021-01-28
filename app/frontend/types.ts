export type BIP32Path = number[]

export interface CryptoProvider {
  network: any
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

export type Transaction = {}
export type HexString = string

export type _XPubKey = {
  path: number[]
  xpubHex: HexString
}

export type _PubKey = {
  path: number[]
  pubHex: HexString
}

export type _PubKeyCbor = {
  path: number[]
  cborHex: HexString
}

export type _Address = {
  path: number[]
  address: string
}

export type AuthMethod = '' | 'hw-wallet' | 'mnemonic' // TODO
export type Ada = number & {__typeAda: any}
export type Lovelace = number & {__typeLovelace: any}

export type AccountInfo = {
  keys: {
    shelleyAccountXpub: _XPubKey
    byronAccountXpub: _XPubKey
    stakingKeyCborHex: _PubKeyCbor
    stakingAddress: string
    stakingAddressHex: HexString
  }
  balance: number
  shelleyBalances: {
    stakingBalance?: number
    nonStakingBalance?: number
    rewardsAccountBalance?: number
  }
  stakePubkeyHex: string
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
  stakingHistory: any
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
