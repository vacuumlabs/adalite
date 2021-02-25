import {HexString, Lovelace} from '../../types'
import {_Certificate, _Input, _Output, _Withdrawal} from '../types'

type encodeCBORFn = any // TODO: type

export type _TxAux = {
  getId: () => HexString
  inputs: _Input[]
  outputs: _Output[]
  fee: number
  ttl: number
  certificates: _Certificate[]
  withdrawals: _Withdrawal[]
  encodeCBOR: encodeCBORFn
}

export type _TxSigned = {
  getId: () => HexString
  encodeCBOR: encodeCBORFn
}

export type _SignedTx = {
  txBody: HexString
  txHash: HexString
}

// TX

export const enum TxBodyKey {
  INPUTS = 0,
  OUTPUTS = 1,
  FEE = 2,
  TTL = 3,
  CERTIFICATES = 4,
  WITHDRAWALS = 5,
  META_DATA_HASH = 7,
}

export const enum TxWitnessKey {
  SHELLEY = 0,
  BYRON = 2,
}

export const enum TxCertificateKey {
  STAKING_KEY_REGISTRATION = 0,
  STAKING_KEY_DEREGISTRATION = 1,
  DELEGATION = 2,
  STAKEPOOL_REGISTRATION = 3,
}

export const enum TxRelayType {
  SINGLE_HOST_IP = 0,
  SINGLE_HOST_NAME = 1,
  MULTI_HOST_NAME = 2,
}

export type TxInput = [Buffer, number]

export type TxTokens = Map<Buffer, Map<Buffer, number>>

export type TxAmount = Lovelace | [Lovelace, TxTokens]

export type TxOutput = [Buffer, TxAmount]

export type TxWithdrawals = Map<Buffer, Lovelace>

export type TxStakingKeyRegistrationCert = [
  TxCertificateKey.STAKING_KEY_REGISTRATION,
  TxStakeCredential
]

export type TxStakingKeyDeregistrationCert = [
  TxCertificateKey.STAKING_KEY_DEREGISTRATION,
  TxStakeCredential
]

export type TxDelegationCert = [TxCertificateKey.DELEGATION, TxStakeCredential, Buffer]

// prettier-ignore
export type TxSingleHostIPRelay = [
  TxRelayType.SINGLE_HOST_IP,
  number?,
  Buffer?,
  Buffer?,
]

export type TxSingleHostNameRelay = [TxRelayType.SINGLE_HOST_NAME, number, string]

export type TxMultiHostNameRelay = [TxRelayType.MULTI_HOST_NAME, string]

export type TxStakepoolRegistrationCert = [
  TxCertificateKey.STAKEPOOL_REGISTRATION,
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

export type TxCertificate =
  | TxDelegationCert
  | TxStakepoolRegistrationCert
  | TxStakingKeyDeregistrationCert
  | TxStakingKeyRegistrationCert

export type TxWitnessByron = [Buffer, Buffer, Buffer, Buffer]

export type TxWitnessShelley = [Buffer, Buffer]

export type _SignedTxDecoded = [
  Map<TxBodyKey, any>,
  Map<TxWitnessKey, Array<TxWitnessByron | TxWitnessShelley>>,
  Buffer | null
]

export type _UnsignedTxDecoded = [Map<TxBodyKey, any>, Buffer | null]

export type TxWitnesses = Map<TxWitnessKey, Array<TxWitnessByron | TxWitnessShelley>>

export enum TxStakeCredentialType {
  ADDR_KEYHASH = 0,
  // SCRIPTHASH = 1,
}

export type TxStakeCredential = [TxStakeCredentialType, Buffer]
