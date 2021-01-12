import indexIsHardened from './indexIsHardened'
import {HARDENED_THRESHOLD, MAX_BULK_EXPORT_AMOUNT} from './../constants'
import {derivePublic as deriveChildXpub} from 'cardano-crypto.js'
import {isShelleyPath} from '../../wallet/shelley/helpers/addresses'

const BYRON_V2_PATH = [HARDENED_THRESHOLD + 44, HARDENED_THRESHOLD + 1815, HARDENED_THRESHOLD]

type BIP32Path = number[]

function CachedDeriveXpubFactory(derivationScheme, shouldExportPubKeyBulk, deriveXpubsHardenedFn) {
  const derivedXpubs = {}

  async function deriveXpub(absDerivationPath: BIP32Path) {
    const memoKey = JSON.stringify(absDerivationPath)

    if (!derivedXpubs[memoKey]) {
      const deriveHardened =
        absDerivationPath.length === 0 || indexIsHardened(absDerivationPath.slice(-1)[0])

      /*
      * we create pubKeyBulk only if the derivation path is from shelley era
      * since there should be only one byron account exported in the fist shelley pubKey bulk
      */

      if (deriveHardened) {
        const derivationPaths =
          shouldExportPubKeyBulk && isShelleyPath(absDerivationPath)
            ? createPathBulk(absDerivationPath)
            : [absDerivationPath]
        const pubKeys = await _deriveXpubsHardenedFn(derivationPaths)
        Object.assign(derivedXpubs, pubKeys)
      } else {
        derivedXpubs[memoKey] = await deriveXpubNonhardenedFn(absDerivationPath)
      }
    }

    /*
    * we await the derivation of the key so in case the derivation fails
    * the key is not added to the cache
    * this approach depends on the key derivation happening sychronously
    */

    return derivedXpubs[memoKey]
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

    for (let i = 0; i < MAX_BULK_EXPORT_AMOUNT; i += 1) {
      const nextAccountIndex = currentAccountPage * MAX_BULK_EXPORT_AMOUNT + i + HARDENED_THRESHOLD
      const nextAccountPath = [...derivationPath.slice(0, -1), nextAccountIndex]
      paths.push(nextAccountPath)
    }

    /*
    * in case of the account 0 we append also the byron path
    * since during byron era only the first account was used
    */
    if (accountIndex === 0 && !paths.includes(BYRON_V2_PATH)) paths.push(BYRON_V2_PATH)

    return paths
  }

  /*
  * on top of the original deriveXpubHardenedFn this is priming
  * the cache of derived keys to minimize the number of prompts on hardware wallets
  */
  async function _deriveXpubsHardenedFn(derivationPaths: BIP32Path[]): Promise<any> {
    const xPubBulk = await deriveXpubsHardenedFn(derivationPaths)
    const _derivedXpubs = {}
    xPubBulk.forEach((xpub: Buffer, i: number) => {
      const memoKey = JSON.stringify(derivationPaths[i])
      _derivedXpubs[memoKey] = xpub
    })
    return _derivedXpubs
  }

  return deriveXpub
}

export default CachedDeriveXpubFactory
