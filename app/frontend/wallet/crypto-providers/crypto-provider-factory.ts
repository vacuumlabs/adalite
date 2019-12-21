import {CRYPTO_PROVIDER_TYPES} from '../constants'
import CardanoWalletSecretCryptoProvider from './cardano-wallet-secret-crypto-provider'
import CardanoTrezorCryptoProvider from './cardano-trezor-crypto-provider'
import CardanoLedgerCryptoProvider from './cardano-ledger-crypto-provider'
import NamedError from '../../helpers/NamedError'

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
        throw NamedError(
          'CryptoProviderError',
          `Unknown crypto provider type: ${cryptoProviderType}`
        )
    }
  }

  return {
    getCryptoProvider,
  }
})()

export default CryptoProviderFactory
