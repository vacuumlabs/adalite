import {toBip32StringPath} from './helpers/bip32'
import NamedError from '../helpers/NamedError'
import {AddressProvider, BIP32Path, _Address} from '../types'
import blockchainExplorer from './blockchain-explorer'

type AddressManagerParams = {
  addressProvider: AddressProvider
  gapLimit: number
  blockchainExplorer: ReturnType<typeof blockchainExplorer>
}

const AddressManager = ({addressProvider, gapLimit, blockchainExplorer}: AddressManagerParams) => {
  if (!gapLimit) {
    throw NamedError('ParamsValidationError', {message: `Invalid gap limit: ${gapLimit}`})
  }

  const deriveAddressMemo: {[key: number]: {path: BIP32Path; address: _Address}} = {}

  async function cachedDeriveAddress(index: number): Promise<_Address> {
    const memoKey = index

    if (!deriveAddressMemo[memoKey]) {
      deriveAddressMemo[memoKey] = await addressProvider(index)
    }

    return deriveAddressMemo[memoKey].address
  }

  async function deriveAddressesBlock(beginIndex: number, endIndex: number): Promise<_Address[]> {
    const derivedAddresses: _Address[] = []
    for (let i = beginIndex; i < endIndex; i += 1) {
      derivedAddresses.push(await cachedDeriveAddress(i))
    }
    return derivedAddresses
  }

  async function discoverAddresses(): Promise<_Address[]> {
    let addresses: _Address[] = []
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

  // this is supposed to return {[key: _Address]: BIP32Path} but ts does support
  // only strings and number as index signatures
  function getAddressToAbsPathMapping(): {[key: string]: BIP32Path} {
    const result = {}
    Object.values(deriveAddressMemo).map((value) => {
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
