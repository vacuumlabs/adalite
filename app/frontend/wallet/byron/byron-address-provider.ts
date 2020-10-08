import {packBootstrapAddress, base58} from 'cardano-crypto.js'
import {HARDENED_THRESHOLD} from '../constants'

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

export const accountXpub = async (cryptoProvider) => {
  const scheme = cryptoProvider.getDerivationScheme()
  const pathMapper = {
    v1: v1Path,
    v2: v2Path,
  }
  const path = pathMapper[scheme.type](0, 0, 0).slice(0, 3)
  const xpub = (await cryptoProvider.deriveXpub(path)).toString('hex')

  return {
    path: [
      path[0] - HARDENED_THRESHOLD,
      path[1] - HARDENED_THRESHOLD,
      path[2] - HARDENED_THRESHOLD,
    ],
    xpub,
  }
}

export const ByronAddressProvider = (
  cryptoProvider,
  accountIndex: number,
  isChange: boolean
) => async (i: number) => {
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
    address: base58.encode(packBootstrapAddress(path, xpub, hdPassphrase, scheme.ed25519Mode)),
  }
}
