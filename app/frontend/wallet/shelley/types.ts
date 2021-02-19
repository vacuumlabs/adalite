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

export type _TxWitnessShelley = {
  publicKey: Buffer
  signature: Buffer
  encodeCBOR: encodeCBORFn
}

export type _TxWitnessByron = {
  publicKey: Buffer
  signature: Buffer
  chaincode: Buffer
  // eslint-disable-next-line camelcase
  address_attributes: any
  encodeCBOR: any
}

export type _TxSigned = {
  getId: () => HexString
  witnesses: any[]
  txAux: any
  encodeCBOR: encodeCBORFn
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

export type TxOutput = [Buffer, number]

export type TxWithdrawals = Map<Buffer, Lovelace>

export type TxStakingKeyRegistrationCert = [
  TxCertificateKey.STAKING_KEY_REGISTRATION,
  [number, Buffer]
]

export type TxStakingKeyDeregistrationCert = [
  TxCertificateKey.STAKING_KEY_DEREGISTRATION,
  [number, Buffer]
]

export type TxDelegationCert = [TxCertificateKey.DELEGATION, [number, Buffer], Buffer]

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
