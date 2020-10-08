import indexIsHardened from './indexIsHardened'
import {derivePublic as deriveChildXpub} from 'cardano-crypto.js'

function CachedDeriveXpubFactory(derivationScheme, deriveXpubHardenedFn) {
  const derivedXpubs = {}

  async function deriveXpub(absDerivationPath) {
    const memoKey = JSON.stringify(absDerivationPath)

    if (!derivedXpubs[memoKey]) {
      const deriveHardened =
        absDerivationPath.length === 0 || indexIsHardened(absDerivationPath.slice(-1)[0])

      /*
      * TODO - reset cache if the promise fails, for now it does not matter
      * since a failure (e.g. rejection by user) there leads to
      * the creation of a fresh wallet and crypto provider instance
      */
      derivedXpubs[memoKey] = deriveHardened
        ? deriveXpubHardenedFn(absDerivationPath)
        : deriveXpubNonhardenedFn(absDerivationPath)
    }

    /*
    * the derivedXpubs map stores promises instead of direct results
    * to deal with concurrent requests to derive the same xpub
    */
    return await derivedXpubs[memoKey]
  }

  async function deriveXpubNonhardenedFn(derivationPath) {
    const lastIndex = derivationPath.slice(-1)[0]
    const parentXpub = await deriveXpub(derivationPath.slice(0, -1))
    return deriveChildXpub(parentXpub, lastIndex, derivationScheme.ed25519Mode)
  }

  return deriveXpub
}

export default CachedDeriveXpubFactory
