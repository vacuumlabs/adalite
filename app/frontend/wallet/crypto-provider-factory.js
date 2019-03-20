const {CRYPTO_PROVIDER_TYPES} = require('./constants')
const CardanoWalletSecretCryptoProvider = require('./cardano-wallet-secret-crypto-provider')
const CardanoTrezorCryptoProvider = require('./cardano-trezor-crypto-provider')
const CardanoLedgerCryptoProvider = require('./cardano-ledger-crypto-provider')

const CryptoProviderFactory = (() => {
  const getCryptoProvider = (cryptoProviderType, config, state) => {
    switch (cryptoProviderType) {
      case CRYPTO_PROVIDER_TYPES.TREZOR:
        return CardanoTrezorCryptoProvider(config, state)

      case CRYPTO_PROVIDER_TYPES.LEDGER:
        return CardanoLedgerCryptoProvider(config, state)

      case CRYPTO_PROVIDER_TYPES.WALLET_SECRET:
        return CardanoWalletSecretCryptoProvider(config, state)

      default:
        throw Error(`Unknown crypto provider type: ${cryptoProviderType}`)
    }
  }

  return {
    getCryptoProvider,
  }
})()

module.exports = CryptoProviderFactory
