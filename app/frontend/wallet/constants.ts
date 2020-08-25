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
export const TX_WITNESS_SIZE_BYTES = 139
export const PROTOCOL_MAGIC_KEY = 2
export const NETWORKS = {
  BYRON: {
    MAINNET: {
      name: 'mainnet',
      protocolMagic: 764824073,
    },
    TESTNET: {
      name: 'testnet',
      protocolMagic: 1097911063,
    },
  },
  SHELLEY: {
    MAINNET: {
      name: 'mainnet',
      networkId: 1,
      protocolMagic: 764824073,
      ttl: 10000000,
    },
    HASKELL_TESTNET: {
      name: 'htn',
      networkId: 0,
      protocolMagic: 42,
      ttl: 500,
    },
    INCENTIVIZED_TESTNET: {
      name: 'itn',
      addressDiscriminator: 'testnet',
      // ./jcli rest v0 settings --output-format=json
      chainConfig: {
        block0Hash: '8e4d2a343f3dcf9330ad9035b3e8d168e6728904262f2c434a4f8f934ec7b676',
        block0Time: '2019-12-13T19:13:37+00:00',
        blockContentMaxSize: 1024000,
        consensusVersion: 'genesis',
        currSlotStartTime: '2019-12-22T10:31:36+00:00',
        epochStabilityDepth: 10,
        fees: {
          certificate: 100000,
          coefficient: 100000,
          constant: 200000,
          per_certificate_fees: {
            certificate_pool_registration: 500000000,
            certificate_stake_delegation: 400000,
          },
        },
        rewardParams: {
          compoundingRatio: {
            denominator: 1,
            numerator: 0,
          },
          compoundingType: 'Linear',
          epochRate: 1,
          epochStart: 1,
          initialValue: 3835616440000,
          poolParticipationCapping: [100, 100],
          rewardDrawingLimitMax: {
            ByStakeAbsolute: {
              denominator: 10000000000,
              numerator: 4109589,
            },
          },
        },
        slotDuration: 2,
        slotsPerEpoch: 43200,
        treasuryTax: {
          fixed: 0,
          ratio: {
            denominator: 10,
            numerator: 1,
          },
        },
      },
    },
  },
}

export const DELAY_AFTER_TOO_MANY_REQUESTS = 2000
export const ADALITE_SUPPORT_EMAIL = 'adalite@vacuumlabs.com'
export const CRYPTO_PROVIDER_TYPES = {
  LEDGER: 'LEDGER',
  TREZOR: 'TREZOR',
  WALLET_SECRET: 'WALLET_SECRET',
}
export const SENTRY_USER_FEEDBACK_API =
  'https://sentry.io/api/0/projects/vacuumlabs-sro/adalite-frontend/user-feedback/'

export const MINIMAL_LEDGER_APP_VERSION = {
  major: 2,
  minor: 0,
  patch: 2,
}

export const RECOMMENDED_LEDGER_APP_VERSION = {
  major: 2,
  minor: 0,
  patch: 4,
}
