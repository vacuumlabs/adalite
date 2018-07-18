const {HARDENED_THRESHOLD} = require('../constants')

function toBip32Path(derivationPath) {
  // 44'/1815'
  let resultPath = [2147483692, 2147485463]

  if (derivationPath.length === 2) {
    resultPath = resultPath.concat([derivationPath[0], 0, derivationPath[1]])
  } else if (derivationPath.length === 1) {
    resultPath.push(derivationPath[0])
  }

  return resultPath
}

function fromBip32Path(bip32Path) {
  switch (bip32Path.length) {
    case 5:
      return [bip32Path[2], bip32Path[4]]
    case 3:
      return [bip32Path[2]]
    case 0:
      return []
    default:
      throw Error(`Unsupported derivation path: ${bip32Path}`)
  }
}

function toBip32StringPath(derivationPath) {
  const bip32Path = toBip32Path(derivationPath)

  return `m/${bip32Path
    .map((item) => (item % HARDENED_THRESHOLD) + (item >= HARDENED_THRESHOLD ? "'" : ''))
    .join('/')}`
}

module.exports = {
  toBip32Path,
  fromBip32Path,
  toBip32StringPath,
}
