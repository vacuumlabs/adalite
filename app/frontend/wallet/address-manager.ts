import {toBip32StringPath} from './helpers/bip32'
import NamedError from '../helpers/NamedError'

const AddressManager = ({addressProvider, gapLimit, blockchainExplorer}) => {
  if (!gapLimit) {
    throw NamedError('ParamsValidationError', {message: `Invalid gap limit: ${gapLimit}`})
  }

  const deriveAddressMemo = {}

  async function cachedDeriveAddress(index: number) {
    const memoKey = index

    if (!deriveAddressMemo[memoKey]) {
      deriveAddressMemo[memoKey] = await addressProvider(index)
    }

    return deriveAddressMemo[memoKey].address
  }

  async function deriveAddressesBlock(beginIndex: number, endIndex: number) {
    const derivedAddresses = []
    for (let i = beginIndex; i < endIndex; i += 1) {
      derivedAddresses.push(await cachedDeriveAddress(i))
    }
    return derivedAddresses
  }

  async function discoverAddresses() {
    let addresses = []
    let from = 0
    let isGapBlock = false

    while (!isGapBlock) {
      const currentAddressBlock = await deriveAddressesBlock(from, from + gapLimit)

      isGapBlock = !(await blockchainExplorer.isSomeAddressUsed(currentAddressBlock))

      addresses =
        isGapBlock && addresses.length > 0 ? addresses : addresses.concat(currentAddressBlock)
      from += gapLimit
    }

    return addresses
  }

  // TODO(ppershing): we can probably get this info more easily
  // just by testing filterUnusedAddresses() backend call
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

  function getAddressToAbsPathMapping() {
    const result = {}
    Object.keys(deriveAddressMemo).map((key) => {
      const value = deriveAddressMemo[key]
      result[value.address] = value.path
    })

    return result
  }

  return {
    discoverAddresses,
    discoverAddressesWithMeta,
    getAddressToAbsPathMapping,
    _deriveAddress: cachedDeriveAddress,
    _deriveAddresses: deriveAddressesBlock,
  }
}

export default AddressManager
