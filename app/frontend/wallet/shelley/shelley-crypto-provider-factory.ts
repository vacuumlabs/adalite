import {CRYPTO_PROVIDER_TYPES} from '../constants'
import ShelleyJsCryptoProvider from './shelley-js-crypto-provider'
import ShelleyTrezorCryptoProvider from './shelley-trezor-crypto-provider'
import ShelleyLedgerCryptoProvider from './shelley-ledger-crypto-provider'
import NamedError from '../../helpers/NamedError'

const ShelleyCryptoProviderFactory = (() => {
  const getCryptoProvider = (cryptoProviderType, options) => {
    switch (cryptoProviderType) {
      case CRYPTO_PROVIDER_TYPES.TREZOR:
        return ShelleyTrezorCryptoProvider(options)

      case CRYPTO_PROVIDER_TYPES.LEDGER:
        return ShelleyLedgerCryptoProvider(options)

      case CRYPTO_PROVIDER_TYPES.WALLET_SECRET:
        return ShelleyJsCryptoProvider(options)

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

export default ShelleyCryptoProviderFactory
