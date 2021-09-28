import {
  AddressProvider,
  CryptoProvider,
  CryptoProviderFeature,
  HexString,
  _XPubKey,
} from '../../types'
import {packBootstrapAddress} from 'cardano-crypto.js'
import {HARDENED_THRESHOLD} from '../constants'
import {encodeAddress} from '../shelley/helpers/addresses'

const v1Path = (account: number, isChange: boolean, addrIdx: number) => {
  return [
    HARDENED_THRESHOLD + account,
    // Note: path does not contain isChange
    HARDENED_THRESHOLD + addrIdx,
  ]
}

const v2Path = (account: number, isChange: boolean, addrIdx: number) => {
  return [
    HARDENED_THRESHOLD + 44,
    HARDENED_THRESHOLD + 1815,
    HARDENED_THRESHOLD + account,
    isChange ? 1 : 0,
    addrIdx,
  ]
}

export const getAccountXpub = async (
  cryptoProvider: CryptoProvider,
  accountIndex: number
): Promise<_XPubKey> => {
  if (accountIndex !== 0 || !cryptoProvider.isFeatureSupported(CryptoProviderFeature.BYRON)) {
    return null
  }
  const scheme = cryptoProvider.getDerivationScheme()
  const pathMapper = {
    v1: v1Path,
    v2: v2Path,
  }
  const path = pathMapper[scheme.type](accountIndex, false, 0).slice(0, 3)
  const xpubHex: HexString = (await cryptoProvider.deriveXpub(path)).toString('hex')

  return {
    path,
    xpubHex,
  }
}

export const ByronAddressProvider = (
  cryptoProvider: CryptoProvider,
  accountIndex: number,
  isChange: boolean
): AddressProvider => async (i: number) => {
  const scheme = cryptoProvider.getDerivationScheme()
  const pathMapper = {
    v1: v1Path,
    v2: v2Path,
  }

  const path = pathMapper[scheme.type](accountIndex, isChange, i)

  const xpub = await cryptoProvider.deriveXpub(path)
  const hdPassphrase = scheme.type === 'v1' ? await cryptoProvider.getHdPassphrase() : undefined

  return {
    path,
    address: encodeAddress(
      packBootstrapAddress(
        path,
        xpub,
        hdPassphrase,
        scheme.ed25519Mode,
        cryptoProvider.network.protocolMagic
      )
    ),
  }
}
