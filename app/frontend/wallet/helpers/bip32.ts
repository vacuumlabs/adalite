import {HARDENED_THRESHOLD} from '../constants'
import NamedError from '../../helpers/NamedError'

function toBip32Path(derivationPath) {
  // 44'/1815'
  const cardanoPrefix = [2147483692, 2147485463]

  return cardanoPrefix.concat(derivationPath)
}

function fromBip32Path(bip32Path) {
  switch (bip32Path.length) {
    case 5:
      return [bip32Path[2], bip32Path[3], bip32Path[4]]
    case 3:
      return [bip32Path[2]]
    case 0:
      return []
    default:
      throw NamedError('UnsupportedOperationError', {
        message: `Unsupported derivation path: ${bip32Path}`,
      })
  }
}

function toBip32StringPath(derivationPath) {
  return `m/${derivationPath
    .map((item) => (item % HARDENED_THRESHOLD) + (item >= HARDENED_THRESHOLD ? "'" : ''))
    .join('/')}`
}

export {toBip32Path, fromBip32Path, toBip32StringPath}
