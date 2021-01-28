import {CryptoProviderType} from '../constants'
import ShelleyJsCryptoProvider from './shelley-js-crypto-provider'
import ShelleyTrezorCryptoProvider from './shelley-trezor-crypto-provider'
import ShelleyLedgerCryptoProvider from './shelley-ledger-crypto-provider'
import NamedError from '../../helpers/NamedError'
import {CryptoProvider} from '../../types'

const ShelleyCryptoProviderFactory = (() => {
  const getCryptoProvider = (
    cryptoProviderType: CryptoProviderType,
    options: any
  ): Promise<CryptoProvider> => {
    switch (cryptoProviderType) {
      case CryptoProviderType.TREZOR:
        return ShelleyTrezorCryptoProvider(options)

      case CryptoProviderType.LEDGER:
        return ShelleyLedgerCryptoProvider(options)

      case CryptoProviderType.WALLET_SECRET:
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
