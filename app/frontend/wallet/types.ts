import {BIP32Path, CertificateType, Lovelace, Token, _Address} from '../types'

export const enum NetworkId {
  MAINNET = 1,
  TESTNET = 0,
}

export const enum ProtocolMagic {
  MAINNET = 764824073,
  HASKELL_TESTNET = 42,
  MARY_TESTNET = 1097911063,
}

export type Network = {
  name: string
  networkId: NetworkId
  protocolMagic: ProtocolMagic
  eraStartSlot: number
  eraStartDateTime: number
  epochsToRewardDistribution: number
  minimalOutput: number
}

export const enum CryptoProviderType {
  LEDGER = 'LEDGER',
  TREZOR = 'TREZOR',
  WALLET_SECRET = 'WALLET_SECRET',
}

export type UTxO = {
  txHash: string
  address: _Address
  coins: Lovelace
  tokens: Token[]
  outputIndex: number
}

export type _Input = UTxO

export type _Output =
  | {
      isChange: false
      address: _Address
      coins: Lovelace
      tokens: Token[]
    }
  | {
      isChange: true
      address: _Address
      coins: Lovelace
      tokens: Token[]
      spendingPath: BIP32Path
      stakingPath: BIP32Path
    }

export type _Certificate =
  | _StakingKeyRegistrationCertificate
  | _StakingKeyDeregistrationCertificate
  | _DelegationCertificate
  | _StakepoolRegistrationCertificate

export type _StakingKeyRegistrationCertificate = {
  type: CertificateType.STAKING_KEY_REGISTRATION
  stakingAddress: _Address
}

export type _StakingKeyDeregistrationCertificate = {
  type: CertificateType.STAKING_KEY_DEREGISTRATION
  stakingAddress: _Address
}

export type _DelegationCertificate = {
  type: CertificateType.DELEGATION
  stakingAddress: _Address
  poolHash: string
}

export type _StakepoolRegistrationCertificate = {
  type: CertificateType.STAKEPOOL_REGISTRATION
  stakingAddress: _Address
  poolRegistrationParams: any
}

export type _Withdrawal = {
  stakingAddress: _Address
  rewards: Lovelace
}

export type _ShelleyWitness = {
  publicKey: Buffer
  signature: Buffer
}

export type _ByronWitness = {
  publicKey: Buffer
  signature: Buffer
  chainCode: Buffer
  addressAttributes: any // TODO:
}
