import {BIP32Path, HexString, _Address} from '../../../types'
import {
  packBaseAddress,
  packRewardAddress,
  getAddressType,
  AddressTypes,
  base58,
  bech32,
  getPubKeyBlake2b224Hash,
  getShelleyAddressNetworkId,
} from 'cardano-crypto.js'
import {HARDENED_THRESHOLD} from '../../constants'
import {NetworkId} from '../../types'
import {encode} from 'borc'

export const encodeAddress = (address: Buffer): _Address => {
  const addressType = getAddressType(address)
  if (addressType === AddressTypes.BOOTSTRAP) {
    return base58.encode(address)
  }
  const addressPrefixes: {[key: number]: string} = {
    [AddressTypes.BASE]: 'addr',
    [AddressTypes.POINTER]: 'addr',
    [AddressTypes.ENTERPRISE]: 'addr',
    [AddressTypes.REWARD]: 'stake',
  }
  const isTestnet = getShelleyAddressNetworkId(address) === NetworkId.TESTNET
  const addressPrefix = `${addressPrefixes[addressType]}${isTestnet ? '_test' : ''}`
  return bech32.encode(addressPrefix, address)
}

export const assetNameHex2Readable = (assetNameHex: HexString) =>
  Buffer.from(assetNameHex, 'hex').toString()

export const xpub2pub = (xpub: Buffer) => xpub.slice(0, 32)

export const xpub2ChainCode = (xpub: Buffer) => xpub.slice(32, 64)

// takes xpubkey, converts it to pubkey and then to 28 byte blake2b encoded hash
const xpub2blake2b224Hash = (xpub: Buffer) => getPubKeyBlake2b224Hash(xpub2pub(xpub))

// TODO: do this more precisely
export const isShelleyPath = (path: BIP32Path) => path[0] - HARDENED_THRESHOLD === 1852

// TODO: do this properly with cardano-crypto unpackAddress
export const isV1Address = (address: string) => address.startsWith('D')

export const xpubHexToCborPubHex = (xpubHex: HexString) =>
  encode(Buffer.from(xpubHex, 'hex').slice(0, 32)).toString('hex')

// TODO: replace this with isValidShelleyAddress from cardano-crypto.js
export const isShelleyFormat = (address: string): boolean => {
  return address.startsWith('addr') || address.startsWith('stake')
}

export const bechAddressToHex = (address: string): HexString => {
  if (!isShelleyFormat(address)) throw Error('Invalid address')
  const parsed = bech32.decode(address)
  return parsed.data.toString('hex')
}

export const base58AddressToHex = (address: string): HexString => {
  const parsed = base58.decode(address)
  return parsed.toString('hex')
}

export const stakingAddressFromXpub = (stakeXpub: Buffer, networkId: NetworkId): _Address => {
  const addrBuffer: Buffer = packRewardAddress(xpub2blake2b224Hash(stakeXpub), networkId)
  return encodeAddress(addrBuffer)
}

export const baseAddressFromXpub = (
  spendXpub: Buffer,
  stakeXpub: Buffer,
  networkId: NetworkId
): _Address => {
  const addrBuffer = packBaseAddress(
    xpub2blake2b224Hash(spendXpub),
    xpub2blake2b224Hash(stakeXpub),
    networkId
  )
  return encodeAddress(addrBuffer)
}

export const isBase = (address: HexString): boolean => {
  return getAddressType(Buffer.from(address, 'hex')) === AddressTypes.BASE
}

export const isByron = (address: HexString): boolean => {
  return getAddressType(Buffer.from(address, 'hex')) === AddressTypes.BOOTSTRAP
}

export const addressToHex = (address: string): HexString =>
  // TODO: we should restrict the type of address to _Address and in that case
  // we dont need to validate the address
  isShelleyFormat(address) ? bechAddressToHex(address) : base58AddressToHex(address)
