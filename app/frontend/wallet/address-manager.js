const range = require('./helpers/range')
const {toBip32StringPath} = require('./helpers/bip32')
const {packAddress} = require('cardano-crypto.js')

const AddressManager = ({
  accountIndex,
  addressLimit,
  cryptoProvider,
  derivationScheme,
  disableCaching, // good for tests
  isChange,
}) => {
  const state = {
    deriveAddressMemo: {},
  }

  function discoverAddresses() {
    const childIndexBegin = derivationScheme.startAddressIndex
    const childIndexEnd = childIndexBegin + addressLimit
    const absDerivationPaths = range(childIndexBegin, childIndexEnd)
      .map((i) => [accountIndex, isChange ? 1 : 0, i])
      .map(derivationScheme.toAbsoluteDerivationPath)

    return deriveAddresses(absDerivationPaths)
  }

  async function discoverAddressesWithMeta() {
    return (await discoverAddresses()).map((address) => {
      return {
        address,
        bip32StringPath: toBip32StringPath(getAddressToAbsPathMapping()[address]),
      }
    })
  }

  function deriveAddresses(absDerivationPaths) {
    return Promise.all(absDerivationPaths.map(deriveAddress))
  }

  async function deriveAddress(absDerivationPath) {
    // in derivation scheme 1, the middle part of the derivation path is skipped
    const memoKey = JSON.stringify(absDerivationPath)

    if (!state.deriveAddressMemo[memoKey] || disableCaching) {
      const xpub = await cryptoProvider.deriveXpub(absDerivationPath)
      const hdPassphrase =
        derivationScheme.type === 'v1' ? await cryptoProvider.getHdPassphrase() : undefined

      state.deriveAddressMemo[memoKey] = packAddress(
        absDerivationPath,
        xpub,
        hdPassphrase,
        derivationScheme.number
      )
    }

    return state.deriveAddressMemo[memoKey]
  }

  function getAddressToAbsPathMapping() {
    const result = {}
    Object.keys(state.deriveAddressMemo).map((key) => {
      result[state.deriveAddressMemo[key]] = JSON.parse(key)
    })

    return result
  }

  return {
    discoverAddresses,
    discoverAddressesWithMeta,
    getAddressToAbsPathMapping,
    _deriveAddress: deriveAddress,
    _deriveAddresses: deriveAddresses,
  }
}

module.exports = AddressManager
