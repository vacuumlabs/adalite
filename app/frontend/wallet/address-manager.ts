import range from './helpers/range'
import {toBip32StringPath} from './helpers/bip32'
import {packAddress} from 'cardano-crypto.js'
import NamedError from '../helpers/NamedError'

const AddressManager = ({
  accountIndex,
  defaultAddressCount,
  gapLimit,
  cryptoProvider,
  disableCaching, // good for tests
  isChange,
  blockchainExplorer,
}) => {
  const deriveAddressMemo = {}
  const derivationScheme = cryptoProvider.getDerivationScheme()

  validateParams()

  function validateParams() {
    if (!gapLimit) {
      throw NamedError('ParamsValidationError', `Invalid gap limit: ${gapLimit}`)
    }
    if (!defaultAddressCount) {
      throw NamedError(
        'ParamsValidationError',
        `Invalid defaultAddressCount: ${defaultAddressCount}`
      )
    }
  }

  async function discoverAddresses() {
    switch (derivationScheme.type) {
      case 'v1':
        return await discoverAddressesWithGapLimit()
      case 'v2':
        return await discoverAddressesWithGapLimit()
      default:
        throw NamedError(
          'DerivationSchemeError',
          `Unexpected derivation scheme: ${derivationScheme.type}`
        )
    }
  }

  async function discoverAddressesWithGapLimit() {
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

    return addresses
  }

  function deriveAddressesBlock(childIndexBegin, childIndexEnd) {
    const absDerivationPaths = range(childIndexBegin, childIndexEnd)
      .map((i) => [accountIndex, isChange ? 1 : 0, i])
      .map(derivationScheme.toAbsoluteDerivationPath)

    return deriveAddresses(absDerivationPaths)
  }

  async function discoverAddressesWithMeta() {
    const addresses = await discoverAddresses()
    const usedAddresses = await blockchainExplorer.filterUsedAddresses(addresses)

    return addresses.map((address) => {
      return {
        address,
        bip32StringPath: toBip32StringPath(getAddressToAbsPathMapping()[address]),
        isUsed: usedAddresses.has(address),
      }
    })
  }

  function deriveAddresses(absDerivationPaths) {
    return Promise.all(absDerivationPaths.map(deriveAddress))
  }

  async function deriveAddress(absDerivationPath) {
    // in derivation scheme 1, the middle part of the derivation path is skipped
    const memoKey = JSON.stringify(absDerivationPath)

    if (!deriveAddressMemo[memoKey] || disableCaching) {
      const xpub = await cryptoProvider.deriveXpub(absDerivationPath)
      const hdPassphrase =
        derivationScheme.type === 'v1' ? await cryptoProvider.getHdPassphrase() : undefined

      deriveAddressMemo[memoKey] = packAddress(
        absDerivationPath,
        xpub,
        hdPassphrase,
        derivationScheme.number
      )
    }

    return deriveAddressMemo[memoKey]
  }

  function getAddressToAbsPathMapping() {
    const result = {}
    Object.keys(deriveAddressMemo).map((key) => {
      result[deriveAddressMemo[key]] = JSON.parse(key)
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

export default AddressManager
