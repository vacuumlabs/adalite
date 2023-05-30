import {InternalErrorReason} from '../errors'
import {CryptoProviderFeature} from '../types'
import {Network, NetworkId, ProtocolMagic} from './types'
import BigNumber from 'bignumber.js'

export const HARDENED_THRESHOLD = 0x80000000
export const MAX_INT32 = 2147483647
export const MAX_UINT64 = new BigNumber(2).pow(64).minus(1)
export const MAX_ADDRESS_INFO_AGE = 10000
export const BTC_BLOCKCHAIN_EXPLORER = 'https://www.blockchain.com/btc/address/'
export const ETH_BLOCKCHAIN_EXPLORER = 'https://etherscan.io/address/'
export const BTC_DONATION_ADDRESS = 'bc1qjdvjjhm5ynucwltmrxpnk6van4ve06528x6q99'
export const ETH_DONATION_ADDRESS = '0xe1575549f79742d21E56426a1F9AD26997F5B9fb'
export const ADA_DONATION_ADDRESS =
  'addr1qxfxlatvpnl7wywyz6g4vqyfgmf9mdyjsh3hnec0yuvrhk8jh8axm6pzha46j5e7j3a2mjdvnpufphgjawhyh0tg9r3sk85ls4'

export const TX_WITNESS_SIZES = {
  byronv2: 139,
  shelley: 139, //TODO: this is too much
  byronV1: 170,
}

export const MAX_TX_SIZE = 16384
export const MAX_TX_OUTPUT_SIZE = 4000
export const CATALYST_SIGNATURE_BYTE_LENGTH = 64
export const METADATA_HASH_BYTE_LENGTH = 32
export const VOTING_PIN_LENGTH = 4

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
  TESTNET: {
    name: 'public-testnet',
    networkId: NetworkId.TESTNET_OR_PREPROD,
    protocolMagic: ProtocolMagic.TESTNET,
    eraStartSlot: 0,
    eraStartDateTime: Date.parse('24 Jul 2019 20:20:16 UTC'),
    epochsToRewardDistribution: 4,
    minimalOutput: 1000000,
  },
  PREPROD: {
    name: 'preprod',
    networkId: NetworkId.TESTNET_OR_PREPROD,
    protocolMagic: ProtocolMagic.PREPROD,
    eraStartSlot: 86400,
    eraStartDateTime: Date.parse('26 Jun 2022 00:00:00 UTC'),
    epochsToRewardDistribution: 4,
    minimalOutput: 1000000,
  },
}

export const DEFAULT_TTL_SLOTS = 3600 // 1 hour

export const DELAY_AFTER_TOO_MANY_REQUESTS = 2000

export const ADALITE_SUPPORT_EMAIL = 'info@adalite.io'

export const SENTRY_USER_FEEDBACK_API =
  'https://sentry.io/api/0/projects/vacuumlabs-sro/adalite-frontend/user-feedback/'

export const UNKNOWN_POOL_NAME = '<Unknown pool>'

export const PREMIUM_MEMBER_BALANCE_TRESHOLD = 2_500_000_000_000

export const BIG_DELEGATOR_THRESHOLD = 10_000_000_000_000

export const CATALYST_MIN_THRESHOLD = 500_000_000

export const WANTED_DELEGATOR_STAKING_ADDRESSES = [
  'stake1ux2936h9zvwe45pahh73kv0x7a42gvzjy537dwkql0eu4dgswu6up',
]

export const POOLS_TO_DESATURATE = ['03fbee96b84daa1bf91c44b51d2e1cbdda53fd504c98aeb6fd4a55b6']

export const SATURATION_POINT = 70_000_000_000_000

export const BITBOX02_VERSIONS = {
  [CryptoProviderFeature.MINIMAL]: {
    major: 9,
    minor: 8,
    patch: 0,
  },
  [CryptoProviderFeature.MULTI_ASSET]: {
    major: 9,
    minor: 9,
    patch: 0,
  },
}

export const BITBOX02_ERRORS = {
  [CryptoProviderFeature.MINIMAL]: InternalErrorReason.BitBox02OutdatedFirmwareError,
}

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
  [CryptoProviderFeature.MULTI_ASSET]: {
    major: 2,
    minor: 2,
    patch: 0,
  },
  [CryptoProviderFeature.VOTING]: {
    major: 2,
    minor: 3,
    patch: 2,
  },
}

export const LEDGER_ERRORS = {
  [CryptoProviderFeature.MINIMAL]: InternalErrorReason.LedgerOutdatedCardanoAppError,
  [CryptoProviderFeature.WITHDRAWAL]: InternalErrorReason.LedgerWithdrawalNotSupported,
  [CryptoProviderFeature.BULK_EXPORT]: InternalErrorReason.LedgerBulkExportNotSupported,
  [CryptoProviderFeature.POOL_OWNER]: InternalErrorReason.LedgerPoolRegNotSupported,
  [CryptoProviderFeature.VOTING]: InternalErrorReason.LedgerCatalystNotSupported,
}

export const TREZOR_VERSIONS = {
  [CryptoProviderFeature.MINIMAL]: {
    major: 2,
    minor: 3,
    patch: 2,
  },
  [CryptoProviderFeature.POOL_OWNER]: {
    major: 2,
    minor: 3,
    patch: 5,
  },
  [CryptoProviderFeature.MULTI_ASSET]: {
    major: 2,
    minor: 3,
    patch: 5,
  },
  [CryptoProviderFeature.VOTING]: {
    major: 2,
    minor: 4,
    patch: 0,
  },
}

export const TREZOR_ERRORS = {
  [CryptoProviderFeature.POOL_OWNER]: InternalErrorReason.TrezorPoolRegNotSupported,
}

export const MAX_ACCOUNT_INDEX = 30
