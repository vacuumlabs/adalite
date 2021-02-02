export const enum NetworkId {
  MAINNET = 1,
  HASKELL_TESTNET = 0,
}

export const enum ProtocolMagic {
  MAINNET = 764824073,
  HASKELL_TESTNET = 42,
}

export type Network = {
  name: string
  networkId: NetworkId
  protocolMagic: ProtocolMagic
  eraStartSlot: number
  eraStartDateTime: number
  ttlSlots: number
  epochsToRewardDistribution: number
  minimalOutput: number
}

export const enum CryptoProviderType {
  LEDGER = 'LEDGER',
  TREZOR = 'TREZOR',
  WALLET_SECRET = 'WALLET_SECRET',
}
