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

export type AuthMethodEnum = '' | 'hw-wallet' | 'mnemonic' // TODO
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
