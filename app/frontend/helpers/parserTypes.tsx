export const enum TxBodyKeys {
  INPUTS = 0,
  OUTPUTS = 1,
  FEE = 2,
  TTL = 3,
  CERTIFICATES = 4,
  WITHDRAWALS = 5,
  META_DATA_HASH = 7,
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

export type _Input = {
  txHash: Buffer
  outputIndex: number
}

export type _Output = {
  address: Buffer
  coins: number
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

export type _StakepoolRegistrationCert = {
  type: TxCertificateKeys.STAKEPOOL_REGISTRATION
  poolPubKey: Buffer
  operatorPubKey: Buffer
  fixedCost: any
  margin: any
  tagged: any
  rewardAddressBuff: Buffer
  ownerPubKeys: Array<any>
  s1: any
  s2: any
}

export type _Certificates = Array<
  | _StakingKeyRegistrationCert
  | _StakingKeyDeregistrationCert
  | _DelegationCert
  | _StakepoolRegistrationCert
>

export type _Withdrawal = {
  address: Buffer
  coins: number
}

export type _UnsignedTxParsed = {
  inputs: _Input[]
  outputs: _Output[]
  fee: string
  ttl: string
  certificates: _Certificates
  withdrawals: _Withdrawal[]
  metaDataHash?: Buffer
  meta: Buffer | null
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

export const enum WitnessOutputTypes {
  SHELLEY = 'TxWitnessShelley',
  BYRON = 'TxWitnessByron',
}

export type WitnessOutput = {
  type: WitnessOutputTypes
  description: ''
  cborHex: TxWitnessCborHex
}

export type SignedTxOutput = {
  type: 'TxSignedShelley'
  description: ''
  cborHex: SignedTxCborHex
}
