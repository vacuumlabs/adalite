const range = require('./helpers/range')
const {toBip32StringPath} = require('./helpers/bip32')
const {packAddress} = require('cardano-crypto.js')

const AddressManager = ({
  accountIndex,
  addressLimitV1,
  gapLimit,
  cryptoProvider,
  derivationScheme,
  disableCaching, // good for tests
  isChange,
  blockchainExplorer,
}) => {
  const state = {
    deriveAddressMemo: {},
  }

  validateParams()

  function validateParams() {
    if (!gapLimit) {
      throw Error(`Invalid gap limit: ${gapLimit}`)
    }
    if (!addressLimitV1) {
      throw Error(`Invalid addressLimitV1: ${addressLimitV1}`)
    }
  }

  async function discoverAddresses() {
    switch (derivationScheme.type) {
      case 'v1':
        return await discoverAddressesV1()
      case 'v2':
        return await discoverAddressesV2()
      default:
        throw new Error(`Unexpected derivation scheme: ${derivationScheme.type}`)
    }
  }

  function discoverAddressesV1() {
    const childIndexBegin = derivationScheme.startAddressIndex
    const childIndexEnd = childIndexBegin + addressLimitV1
    return deriveAddressesBlock(childIndexBegin, childIndexEnd)
  }

  async function discoverAddressesV2() {
    let addresses = []
    let childIndexBegin = derivationScheme.startAddressIndex
    let isGapBlock = false

    while (!isGapBlock) {
      const currentAddressBlock = await deriveAddressesBlock(
        childIndexBegin,
        childIndexBegin + gapLimit
      )
      isGapBlock = !(await blockchainExplorer.isSomeAddressUsed(currentAddressBlock))
      addresses =
        isGapBlock && addresses.length > 0 ? addresses : addresses.concat(currentAddressBlock)
      childIndexBegin += gapLimit
    }

    return reduceAddressesToV1LimitIfPossible(addresses)
  }

  function deriveAddressesBlock(childIndexBegin, childIndexEnd) {
    const absDerivationPaths = range(childIndexBegin, childIndexEnd)
      .map((i) => [accountIndex, isChange ? 1 : 0, i])
      .map(derivationScheme.toAbsoluteDerivationPath)

    return deriveAddresses(absDerivationPaths)
  }

  /*
   * To maintain default behavior of AdaLite, we reduce addreses
   * to default 10 if no address beyond the first 10 are used
   */
  async function reduceAddressesToV1LimitIfPossible(addresses) {
    const isSomeAddressUsedPastV1Limit = await blockchainExplorer.isSomeAddressUsed(
      addresses.slice(addressLimitV1)
    )
    return isSomeAddressUsedPastV1Limit ? addresses : addresses.slice(0, addressLimitV1)
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
