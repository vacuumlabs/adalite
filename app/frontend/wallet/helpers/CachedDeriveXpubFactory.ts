import indexIsHardened from './indexIsHardened'
import {HARDENED_THRESHOLD, MAX_BULK_EXPORT_AMOUNT} from './../constants'
import {derivePublic as deriveChildXpub} from 'cardano-crypto.js'

const BYRON_V2_PATH = [HARDENED_THRESHOLD + 44, HARDENED_THRESHOLD + 1815, HARDENED_THRESHOLD]

type BIP32Path = number[]

function CachedDeriveXpubFactory(derivationScheme, shouldExportPubKeyBulk, deriveXpubFn) {
  let derivedXpubs = {}

  async function deriveXpub(absDerivationPath: BIP32Path) {
    const memoKey = JSON.stringify(absDerivationPath)

    if (!derivedXpubs[memoKey]) {
      const deriveHardened =
        absDerivationPath.length === 0 || indexIsHardened(absDerivationPath.slice(-1)[0])

      /*
      * TODO - reset cache if the promise fails, for now it does not matter
      * since a failure (e.g. rejection by user) there leads to
      * the creation of a fresh wallet and crypto provider instance
      */

      if (deriveHardened) {
        const pubKeys = await deriveXpubHardenedFn(absDerivationPath)
        Object.assign(derivedXpubs, pubKeys)
      } else {
        derivedXpubs[memoKey] = deriveXpubNonhardenedFn(absDerivationPath)
      }
    }

    /*
    * the derivedXpubs map stores promises instead of direct results
    * to deal with concurrent requests to derive the same xpub
    */
    return await derivedXpubs[memoKey]
  }

  async function deriveXpubNonhardenedFn(derivationPath: BIP32Path) {
    const lastIndex = derivationPath.slice(-1)[0]
    const parentXpub = await deriveXpub(derivationPath.slice(0, -1))
    return deriveChildXpub(parentXpub, lastIndex, derivationScheme.ed25519Mode)
  }

  function createPathBulk(derivationPath: BIP32Path): BIP32Path[] {
    const paths: BIP32Path[] = []
    const accountIndex = derivationPath[2] - HARDENED_THRESHOLD
    const currentAccountPage = Math.floor(accountIndex / MAX_BULK_EXPORT_AMOUNT)

    /*
    * in case of the account 0 we append also the byron path
    * since during byron era only the first account was used
    */
    if (accountIndex === 0) paths.push(BYRON_V2_PATH)

    for (let i = 0; i < MAX_BULK_EXPORT_AMOUNT; i += 1) {
      const nextAccountIndex = currentAccountPage * MAX_BULK_EXPORT_AMOUNT + i + HARDENED_THRESHOLD
      const nextAccountPath = [...derivationPath.slice(0, -1), nextAccountIndex]
      paths.push(nextAccountPath)
    }
    return paths
  }

  async function deriveXpubHardenedFn(derivationPath: BIP32Path): Promise<any> {
    const paths = shouldExportPubKeyBulk ? createPathBulk(derivationPath) : [derivationPath]
    const xPubBulk = await deriveXpubFn(paths)
    const _derivedXpubs = {}
    xPubBulk.forEach((xpub: Buffer, i: number) => {
      const memoKey = JSON.stringify(paths[i])
      _derivedXpubs[memoKey] = Promise.resolve(xpub)
    })
    return _derivedXpubs
  }

  function cleanXpubCache() {
    const _derivedXpubs = {}
    Object.entries(derivedXpubs).map(([key, xpubPromise]: [string, Promise<Buffer>]) => {
      xpubPromise
        .then((xpub) => {
          _derivedXpubs[key] = Promise.resolve(xpub)
        })
        .catch((e) => null)
    })
    derivedXpubs = _derivedXpubs
  }

  return {deriveXpub, cleanXpubCache}
}

export default CachedDeriveXpubFactory
