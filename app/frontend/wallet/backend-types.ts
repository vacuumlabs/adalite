export type StakePoolInfo = {
  pledge: string
  margin: number
  fixedCost: string
  name: string
  ticker: string
  homepage: string
}

type StakePoolInfoExtended = StakePoolInfo & {
  poolHash: string
  liveStake: string
  roa: string
  epochBlocks: string
  lifeTimeBlocks: string
  saturatedPercentage: number
}

export type DelegationHistoryEntry = StakePoolInfoExtended & {
  txHash: string
  time: string
  epochNo: number
}

export enum RewardType {
  REGULAR = 'REGULAR',
  ITN = 'ITN',
  TREASURY = 'TREASURY',
}

export type RewardsHistoryEntry = StakePoolInfoExtended & {
  time: string
  epochNo: number
  forDelegationInEpoch: number
  amount: string
  rewardType: RewardType
}

export type WithdrawalsHistoryEntry = {
  time: string
  epochNo: number
  txHash: string
  amount: string
}

export type StakeRegistrationHistoryEntry = {
  txHash: string
  time: string
  epochNo: number
  action: 'registration' | 'deregistration'
}

export type NextRewardDetail = StakePoolInfoExtended & {
  forEpoch: number
  rewardDate: string
}

export type StakingInfoResponse = {
  currentEpoch: number
  delegation: StakePoolInfoExtended & {
    retiringEpoch: number | null
    url: string
  }
  hasStakingKey: boolean
  rewards: string
  nextRewardDetails: Array<NextRewardDetail>
}

export type BestSlotResponse = {
  Right: {
    bestSlot: number
  }
}

export enum PoolRecommendationStatus {
  INVALID = 'GivenPoolInvalid',
  SATURATED = 'GivenPoolSaturated',
  BEYOND_OPTIMUM = 'GivenPoolBeyondOptimum',
  OK = 'GivenPoolOk',
  UNDER_MINIMUM = 'GivenPoolUnderMinimum',
}

export type PoolRecommendationResponse = StakePoolInfoExtended & {
  status: PoolRecommendationStatus
  recommendedPoolHash: string
  isInRecommendedPoolSet: boolean
}

export declare type Token = {
  policyId: string
  assetName: string
  quantity: string // possibly huge amounts
}

export type CoinObject = {
  getCoin: string
  getTokens: Token[]
}

export type AddressCoinTuple = [string, CoinObject]

export type CaTxEntry = {
  ctbId: string
  ctbTimeIssued: number
  ctbInputs: Array<AddressCoinTuple>
  ctbOutputs: Array<AddressCoinTuple>
  ctbInputSum: CoinObject
  ctbOutputSum: CoinObject
  fee: string
}

export type BulkAddressesSummary = {
  caAddresses: Array<string>
  caTxNum: number
  caBalance: CoinObject
  caTxList: Array<CaTxEntry>
}

export type TxSummary = {
  ctsId: string
  ctsTxTimeIssued: number
  ctsBlockTimeIssued: number
  ctsBlockHeight: number
  ctsBlockEpoch: number
  ctsBlockSlot: number
  ctsBlockHash: string
  ctsRelayedBy: null
  ctsTotalInput: CoinObject
  ctsTotalOutput: CoinObject
  ctsFees: CoinObject
  ctsInputs: Array<AddressCoinTuple>
  ctsOutputs: Array<AddressCoinTuple>
}

export type FailureResponse = {Left: string}
export type SuccessResponse<T> = {
  Right: T
}

export type TxSummaryResponse = SuccessResponse<TxSummary> | FailureResponse
export type BulkAddressesSummaryResponse = SuccessResponse<BulkAddressesSummary> | FailureResponse

export type TxSubmission = {txHash: string}
export type TxSubmissionFailure = FailureResponse & {
  statusCode?: number
}
export type SubmitResponse = SuccessResponse<TxSubmission> | TxSubmissionFailure
export type _Utxo = {
  tag: string
  cuId: string
  cuOutIndex: number
  cuAddress: string
  cuCoins: CoinObject
}
export type BulkAdressesUtxoResponse = SuccessResponse<Array<_Utxo>> | TxSubmissionFailure
