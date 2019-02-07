const Cardano = require('./cardano-wallet')
const {ADALITE_CONFIG} = require('../config')
const {LEDGER, TREZOR, MNEMONIC} = require('./constants')
const derivationSchemes = require('./derivation-schemes')

const CryptoProviderFactory = (() => {

  const UnknownCryptoProviderError = (message) => {
    const error = new Error(message)
    error.name = 'UnknownCryptoProviderError'
    return error
  }

  const getWallet = async (cryptoProvider, secret) => {
    switch (cryptoProvider) {
      case TREZOR:
        return await Cardano.CardanoWallet({
          cryptoProvider: TREZOR,
          config: ADALITE_CONFIG,
          network: 'mainnet',
          derivationScheme: derivationSchemes.v2,
        })

      case LEDGER:
        return await Cardano.CardanoWallet({
          cryptoProvider: LEDGER,
          config: ADALITE_CONFIG,
          network: 'mainnet',
          derivationScheme: derivationSchemes.v2,
        })

      case MNEMONIC:
        secret = secret.trim()
        return await Cardano.CardanoWallet({
          cryptoProvider: MNEMONIC,
          mnemonicOrHdNodeString: secret,
          config: ADALITE_CONFIG,
          network: 'mainnet',
          derivationScheme: derivationSchemes.v1,
        })

      default:
        throw UnknownCryptoProviderError(cryptoProvider)
    }
  }

  return {
    getWallet,
  }
})()

module.exports = CryptoProviderFactory
