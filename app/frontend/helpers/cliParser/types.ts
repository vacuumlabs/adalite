export enum TxBodyKeys {
  INPUTS = 0,
  OUTPUTS = 1,
  FEE = 2,
  TTL = 3,
  CERTIFICATES = 4,
  WITHDRAWALS = 5,
  META_DATA_HASH = 7,
  VALIDITY_INTERVAL_START = 8,
  MINT = 9, // unsupported in current version
}

export const enum TxWitnessKeys {
  SHELLEY = 0,
  BYRON = 2,
}

export const enum TxCertificateKeys {
  STAKING_KEY_REGISTRATION = 0,
  STAKING_KEY_DEREGISTRATION = 1,
  DELEGATION = 2,
  STAKEPOOL_REGISTRATION = 3,
}

export type Lovelace = BigInt

export type _Input = {
  txHash: Buffer
  outputIndex: number
}

export type _Asset = {assetName: Buffer; amount: BigInt}

export type _MultiAsset = {policyId: Buffer; assets: _Asset[]}

export type _Output = {
  address: Buffer
  coins: Lovelace
  tokenBundle: _MultiAsset[]
}

export type _DelegationCert = {
  type: TxCertificateKeys.DELEGATION
  pubKeyHash: Buffer
  poolHash: Buffer
}

export type _StakingKeyRegistrationCert = {
  type: TxCertificateKeys.STAKING_KEY_REGISTRATION
  pubKeyHash: Buffer
}

export type _StakingKeyDeregistrationCert = {
  type: TxCertificateKeys.STAKING_KEY_DEREGISTRATION
  pubKeyHash: Buffer
}

export const enum TxRelayTypes {
  SINGLE_HOST_IP = 0,
  SINGLE_HOST_NAME = 1,
  MULTI_HOST_NAME = 2,
}

export type _SingleHostIPRelay = {
  type: TxRelayTypes.SINGLE_HOST_IP
  portNumber?: number
  ipv4?: Buffer
  ipv6?: Buffer
}

export type _SingleHostNameRelay = {
  type: TxRelayTypes.SINGLE_HOST_NAME
  portNumber?: number
  dnsName: string
}

export type _MultiHostNameRelay = {
  type: TxRelayTypes.MULTI_HOST_NAME
  dnsName: string
}

export type _PoolRelay = {
  type: TxRelayTypes
  portNumber?: number
  ipv4?: Buffer
  ipv6?: Buffer
  dnsName?: string
}

export type _PoolMetadataParams = null | {
  metadataUrl: string
  metadataHash: Buffer
}

export type _Margin = {
  numerator: number
  denominator: number
}

export type _StakepoolRegistrationCert = {
  type: TxCertificateKeys.STAKEPOOL_REGISTRATION
  poolKeyHash: Buffer
  vrfPubKeyHash: Buffer
  pledge: Lovelace
  cost: Lovelace
  margin: _Margin // tagged
  rewardAddress: Buffer
  poolOwnersPubKeyHashes: Array<Buffer>
  relays: Array<_PoolRelay>
  metadata: _PoolMetadataParams
}

export type _Certificate =
  | _StakingKeyRegistrationCert
  | _StakingKeyDeregistrationCert
  | _DelegationCert
  | _StakepoolRegistrationCert

export type _Withdrawal = {
  address: Buffer
  coins: Lovelace
}

export type _UnsignedTxParsed = {
  inputs: _Input[]
  outputs: _Output[]
  fee: Lovelace
  ttl?: BigInt
  certificates: _Certificate[]
  withdrawals: _Withdrawal[]
  metaDataHash?: Buffer
  meta: Buffer | null
  validityIntervalStart?: BigInt
  mint?: _MultiAsset
}

export type TxWitnessByron = [Buffer, Buffer, Buffer, Buffer]

export type TxWitnessShelley = [Buffer, Buffer]

export type _SignedTxDecoded = [
  Map<TxBodyKeys, any>,
  Map<TxWitnessKeys, Array<TxWitnessByron | TxWitnessShelley>>,
  Buffer | null
]

export type _UnsignedTxDecoded = [Map<TxBodyKeys, any>, Buffer | null]

export type SignedTxCborHex = string

export type UnsignedTxCborHex = string

export type TxWitnessCborHex = string

export type XPubKeyCborHex = string

export type pubKeyHex = string

export type XPubKeyHex = string

export type _XPubKey = {
  pubKey: Buffer
  chainCode: Buffer
}

export type _TxAux = _UnsignedTxParsed & {
  getId: () => string
  unsignedTxDecoded: _UnsignedTxDecoded
}

export type _ByronWitness = {
  key: TxWitnessKeys.BYRON
  data: TxWitnessByron
}

export type _ShelleyWitness = {
  key: TxWitnessKeys.SHELLEY
  data: TxWitnessShelley
}

export type WitnessOutput = {
  type: string
  description: ''
  cborHex: TxWitnessCborHex
}

export type SignedTxOutput = {
  type: string
  description: ''
  cborHex: SignedTxCborHex
}

export type TxInput = [Buffer, number]

export type TxAsset = Map<Buffer, number>

export type TxMultiAsset = Map<Buffer, TxAsset>

export type TxOutput = [Buffer, number | [number, TxMultiAsset]]

export type TxStakingKeyRegistrationCert = [
  TxCertificateKeys.STAKING_KEY_REGISTRATION,
  [number, Buffer]
]

export type TxStakingKeyDeregistrationCert = [
  TxCertificateKeys.STAKING_KEY_DEREGISTRATION,
  [number, Buffer]
]

export type TxDelegationCert = [TxCertificateKeys.DELEGATION, [number, Buffer], Buffer]

export type TxSingleHostIPRelay = [TxRelayTypes.SINGLE_HOST_IP, number?, Buffer?, Buffer?]

export type TxSingleHostNameRelay = [TxRelayTypes.SINGLE_HOST_NAME, number, string]

export type TxMultiHostNameRelay = [TxRelayTypes.MULTI_HOST_NAME, string]

export type TxStakepoolRegistrationCert = [
  TxCertificateKeys.STAKEPOOL_REGISTRATION,
  Buffer,
  Buffer,
  number,
  number,
  {
    value: {
      0: number
      1: number
    }
  },
  Buffer,
  Array<Buffer>,
  any,
  [string, Buffer]
]

export type TxWithdrawal = Map<Buffer, Lovelace>
