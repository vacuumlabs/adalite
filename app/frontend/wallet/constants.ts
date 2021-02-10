import {CryptoProviderFeature} from '../types'
import {Network, NetworkId, ProtocolMagic} from './types'
export const HARDENED_THRESHOLD = 0x80000000
export const MAX_INT32 = 2147483647
export const MAX_ADDRESS_INFO_AGE = 10000
export const BTC_BLOCKCHAIN_EXPLORER = 'https://www.blockchain.com/btc/address/'
export const ETH_BLOCKCHAIN_EXPLORER = 'https://etherscan.io/address/'
export const BTC_DONATION_ADDRESS = '3Qk3BDbw4yym6PM6vWA4bAsFkY76EWwtnp'
export const ETH_DONATION_ADDRESS = '0xe1575549f79742d21E56426a1F9AD26997F5B9fb'
export const ADA_DONATION_ADDRESS_BYRON =
  'DdzFFzCqrhsqedBRRVa8dZ9eFQfQErikMsgJC2YkkLY23gK4JzV9y6jKnRL8VSDEqczdzG3WYmj1vsXxCA2j1MvTS6GfMVA2dkiFrkK5'
export const ADA_DONATION_ADDRESS =
  'addr1qxfxlatvpnl7wywyz6g4vqyfgmf9mdyjsh3hnec0yuvrhk8jh8axm6pzha46j5e7j3a2mjdvnpufphgjawhyh0tg9r3sk85ls4'
export const TX_WITNESS_SIZES = {
  byronv2: 139,
  shelley: 139, //TODO: this is too much
  byronV1: 170,
}

export const PROTOCOL_MAGIC_KEY = 2

export const NETWORKS: {[key: string]: Network} = {
  MAINNET: {
    name: 'mainnet',
    networkId: NetworkId.MAINNET,
    protocolMagic: ProtocolMagic.MAINNET,
    eraStartSlot: 4492800, // 21600 slot x 208 epochs
    eraStartDateTime: Date.parse('29 Jul 2020 21:44:51 UTC'),
    epochsToRewardDistribution: 4,
    minimalOutput: 1000000,
  },
  MARY_TESTNET: {
    name: 'mary-testnet',
    networkId: NetworkId.TESTNET,
    protocolMagic: ProtocolMagic.MARY_TESTNET,
    eraStartSlot: 0,
    eraStartDateTime: Date.parse('24 Jul 2019 20:20:16 UTC'),
    epochsToRewardDistribution: 4,
    minimalOutput: 1000000,
  },
}

export const DEFAULT_TTL_SLOTS = 3600

export const DELAY_AFTER_TOO_MANY_REQUESTS = 2000

export const ADALITE_SUPPORT_EMAIL = 'adalite@vacuumlabs.com'

export const SENTRY_USER_FEEDBACK_API =
  'https://sentry.io/api/0/projects/vacuumlabs-sro/adalite-frontend/user-feedback/'

export const UNKNOWN_POOL_NAME = '<Unknown pool>'

export const PREMIUM_MEMBER_BALANCE_TRESHOLD = 2500000000000

export const BIG_DELEGATOR_THRESHOLD = 10000000000000

export const SATURATION_POINT = 62224967000000

export const LEDGER_VERSIONS = {
  [CryptoProviderFeature.MINIMAL]: {
    major: 2,
    minor: 0,
    patch: 2,
  },
  [CryptoProviderFeature.WITHDRAWAL]: {
    major: 2,
    minor: 0,
    patch: 4,
  },
  [CryptoProviderFeature.BULK_EXPORT]: {
    major: 2,
    minor: 1,
    patch: 0,
  },
  [CryptoProviderFeature.POOL_OWNER]: {
    major: 2,
    minor: 1,
    patch: 0,
  },
}

export const LEDGER_ERRORS = {
  [CryptoProviderFeature.MINIMAL]: 'LedgerOutdatedCardanoAppError',
  [CryptoProviderFeature.WITHDRAWAL]: 'LedgerWithdrawalNotSupported',
  [CryptoProviderFeature.BULK_EXPORT]: 'LedgerBulkExportNotSupported',
  [CryptoProviderFeature.POOL_OWNER]: 'LedgerPoolRegNotSupported',
}

export const TREZOR_VERSIONS = {
  [CryptoProviderFeature.POOL_OWNER]: {
    major: 2,
    minor: 3,
    patch: 5,
  },
}

export const TREZOR_ERRORS = {
  [CryptoProviderFeature.POOL_OWNER]: 'TrezorPoolRegNotSupported',
}

export const MAX_ACCOUNT_INDEX = 30

export const MAX_BULK_EXPORT_AMOUNT = 5
