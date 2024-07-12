import {TxPoolParams} from './shelley/helpers/poolCertificateUtils'
import {
  BIP32Path,
  CertificateType,
  Lovelace,
  Address,
  TokenBundle,
  HexString,
  CryptoProviderFeature,
} from '../types'

export const enum WalletName {
  BITBOX02 = 'BitBox02',
  LEDGER = 'Ledger',
  TREZOR = 'Trezor',
  MNEMONIC = 'Mnemonic',
}

export const enum NetworkId {
  MAINNET = 1,
  TESTNETS = 0,
}

export const enum ProtocolMagic {
  MAINNET = 764824073,
  PREPROD = 1,
  SANCHONET = 4,
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

export enum CryptoProviderType {
  BITBOX02 = 'BITBOX02',
  LEDGER = 'LEDGER',
  TREZOR = 'TREZOR',
  WALLET_SECRET = 'WALLET_SECRET',
}

export type HwWalletCryptoProviderType = Exclude<
  CryptoProviderType,
  CryptoProviderType.WALLET_SECRET
>

export type CryptoProviderInfo = {
  type: CryptoProviderType
  supportedFeatures: Array<CryptoProviderFeature>
}

export type UTxO = {
  txHash: string
  address: Address
  coins: Lovelace
  tokenBundle: TokenBundle
  outputIndex: number
}

export type TxInput = UTxO

export type TxOutput =
  | {
      isChange: false
      address: Address
      coins: Lovelace
      tokenBundle: TokenBundle
    }
  | {
      isChange: true
      address: Address
      coins: Lovelace
      tokenBundle: TokenBundle
      spendingPath: BIP32Path
      stakingPath: BIP32Path
    }

export type TxCertificate =
  | TxStakingKeyRegistrationCert
  | TxStakingKeyDeregistrationCert
  | TxDelegationCert
  | TxStakepoolRegistrationCert
  | TxVoteDelegationCert

export type TxStakingKeyRegistrationCert = {
  type: CertificateType.STAKING_KEY_REGISTRATION
  stakingAddress: Address
}

export type TxStakingKeyDeregistrationCert = {
  type: CertificateType.STAKING_KEY_DEREGISTRATION
  stakingAddress: Address
}

export type TxDelegationCert = {
  type: CertificateType.DELEGATION
  stakingAddress: Address
  poolHash: string
}

export type TxStakepoolRegistrationCert = {
  type: CertificateType.STAKEPOOL_REGISTRATION
  stakingAddress: Address
  poolRegistrationParams: TxPoolParams
}

export const enum TxDRepType {
  // ADDR_KEYHASH = 0,
  // SCRIPTHASH = 1
  ALWAYS_ABSTAIN = 2, // only always abstain is supported for now
  // ALWAYS_NO_CONFIDENCE = 3,
}

export type TxVoteDelegationCert = {
  type: CertificateType.VOTE_DELEGATION
  stakingAddress: Address
  dRep: {
    type: TxDRepType.ALWAYS_ABSTAIN
  }
}

export type TxWithdrawal = {
  stakingAddress: Address
  rewards: Lovelace
}

export type TxAuxiliaryDataTypes = 'CATALYST_VOTING'

export type TxPlanAuxiliaryData = TxPlanVotingAuxiliaryData
export type TxAuxiliaryData = TxVotingAuxiliaryData

export type TxPlanVotingAuxiliaryData = {
  type: TxAuxiliaryDataTypes
  votingPubKey: string
  stakePubKey: HexString
  nonce: BigInt
  rewardDestinationAddress: {
    address: Address
  }
}

export type TxVotingAuxiliaryData = TxPlanVotingAuxiliaryData & {
  rewardDestinationAddress: {
    address: Address
    stakingPath: BIP32Path
    spendingPath: BIP32Path
  }
}

export type TxShelleyWitness = {
  publicKey: Buffer
  signature: Buffer
}

export type TxByronWitness = {
  publicKey: Buffer
  signature: Buffer
  chainCode: Buffer
  addressAttributes: any // TODO:
}
