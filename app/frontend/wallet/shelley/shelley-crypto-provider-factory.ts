import {CryptoProviderType} from '../types'
import ShelleyJsCryptoProvider from './shelley-js-crypto-provider'
import ShelleyBitBox02CryptoProvider from './shelley-bitbox02-crypto-provider'
import ShelleyTrezorCryptoProvider from './shelley-trezor-crypto-provider'
import ShelleyLedgerCryptoProvider from './shelley-ledger-crypto-provider'
import {CryptoProvider} from '../../types'
import {InternalError, InternalErrorReason} from '../../errors'

const ShelleyCryptoProviderFactory = (() => {
  const getCryptoProvider = (
    cryptoProviderType: CryptoProviderType,
    options: any
  ): Promise<CryptoProvider> => {
    switch (cryptoProviderType) {
      case CryptoProviderType.BITBOX02:
        return ShelleyBitBox02CryptoProvider(options)
      case CryptoProviderType.TREZOR:
        return ShelleyTrezorCryptoProvider(options)

      case CryptoProviderType.LEDGER:
        return ShelleyLedgerCryptoProvider(options)

      case CryptoProviderType.WALLET_SECRET:
        return ShelleyJsCryptoProvider(options)

      default:
        throw new InternalError(InternalErrorReason.CryptoProviderError, {
          message: `Unknown crypto provider type: ${cryptoProviderType}`,
        })
    }
  }

  return {
    getCryptoProvider,
  }
})()

export default ShelleyCryptoProviderFactory
