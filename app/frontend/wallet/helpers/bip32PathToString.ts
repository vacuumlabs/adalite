import {BIP32Path} from '../../types'
import {HARDENED_THRESHOLD} from '../constants'

/** Builds a BIP32 path string for @scure/bip32 `derive()`, e.g. m/44'/1815'/0'/0/0 */
export function bip32PathToString(path: BIP32Path): string {
  const segments = path.map((n) =>
    n >= HARDENED_THRESHOLD ? `${n - HARDENED_THRESHOLD}'` : String(n)
  )
  return `m/${segments.join('/')}`
}
