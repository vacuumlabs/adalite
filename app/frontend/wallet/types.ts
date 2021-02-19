import {CertificateType, Lovelace, _Address} from '../types'

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
  outputIndex: number
}

export type _Input = UTxO

export type _Output =
  | {
      address: _Address
      coins: Lovelace
    }
  | {
      address: _Address
      coins: Lovelace
      spendingPath: any
      stakingPath: any
    }

export type _Certificate = {
  type: CertificateType
  poolHash?: string
  stakingAddress: _Address
  poolRegistrationParams?: any
}

export type _Withdrawal = {
  stakingAddress: _Address
  rewards: Lovelace
}
