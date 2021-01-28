export type Transaction = {}

export type AuthMethodEnum = '' | 'hw-wallet' | 'mnemonic' // TODO
export type Ada = number & {__typeAda: any}
export type Lovelace = number & {__typeLovelace: any}

export type AccountInfo = {
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
