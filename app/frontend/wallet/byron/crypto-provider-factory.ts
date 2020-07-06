import {CRYPTO_PROVIDER_TYPES} from '../constants'
import CardanoWalletSecretCryptoProvider from './cardano-wallet-secret-crypto-provider'
import CardanoTrezorCryptoProvider from './cardano-trezor-crypto-provider'
import CardanoLedgerCryptoProvider from './cardano-ledger-crypto-provider'
import NamedError from '../../helpers/NamedError'

const CryptoProviderFactory = (() => {
  const getCryptoProvider = (cryptoProviderType, options) => {
    switch (cryptoProviderType) {
      case CRYPTO_PROVIDER_TYPES.TREZOR:
        return CardanoTrezorCryptoProvider(options)

      case CRYPTO_PROVIDER_TYPES.LEDGER:
        return CardanoLedgerCryptoProvider(options)

      case CRYPTO_PROVIDER_TYPES.WALLET_SECRET:
        return CardanoWalletSecretCryptoProvider(options)

      default:
        throw NamedError('CryptoProviderError', {
          message: `Unknown crypto provider type: ${cryptoProviderType}`,
        })
    }
  }

  return {
    getCryptoProvider,
  }
})()

export default CryptoProviderFactory
