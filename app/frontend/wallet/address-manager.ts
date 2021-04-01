import {toBip32StringPath} from './helpers/bip32'
import {AddressProvider, AddressToPathMapping, AddressWithMeta, BIP32Path, Address} from '../types'
import blockchainExplorer from './blockchain-explorer'
import {UnexpectedError, UnexpectedErrorReason} from '../errors'

type AddressManagerParams = {
  addressProvider: AddressProvider
  gapLimit: number
  blockchainExplorer: ReturnType<typeof blockchainExplorer>
}

const AddressManager = ({addressProvider, gapLimit, blockchainExplorer}: AddressManagerParams) => {
  if (!gapLimit) {
    throw new UnexpectedError(UnexpectedErrorReason.ParamsValidationError, {
      message: `Invalid gap limit: ${gapLimit}`,
    })
  }

  const deriveAddressMemo: {[key: number]: {path: BIP32Path; address: Address}} = {}

  async function cachedDeriveAddress(index: number): Promise<Address> {
    const memoKey = index

    if (!deriveAddressMemo[memoKey]) {
      deriveAddressMemo[memoKey] = await addressProvider(index)
    }

    return deriveAddressMemo[memoKey].address
  }

  async function deriveAddressesBlock(beginIndex: number, endIndex: number): Promise<Address[]> {
    const derivedAddresses: Address[] = []
    for (let i = beginIndex; i < endIndex; i += 1) {
      derivedAddresses.push(await cachedDeriveAddress(i))
    }
    return derivedAddresses
  }

  async function discoverAddresses(): Promise<Address[]> {
    let addresses: Address[] = []
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

  async function discoverAddressesWithMeta(): Promise<AddressWithMeta[]> {
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

  // this is supposed to return {[key: Address]: BIP32Path} but ts does support
  // only strings and number as index signatures

  function getAddressToAbsPathMapping(): AddressToPathMapping {
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
