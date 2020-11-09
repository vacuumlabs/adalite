import bech32 from './bech32'
import {
  packBaseAddress,
  packRewardAddress,
  getAddressType,
  AddressTypes,
  base58,
  getPubKeyBlake2b224Hash,
} from 'cardano-crypto.js'
import {HARDENED_THRESHOLD} from '../../constants'

type HexString = string // TODO: specify

const xpub2pub = (xpub: Buffer) => xpub.slice(0, 32)

// takes xpubkey, converts it to pubkey and then to 28 byte blake2b encoded hash
const xpub2blake2b224Hash = (xpub: Buffer) => getPubKeyBlake2b224Hash(xpub2pub(xpub))

type Xpub = Buffer

// TODO: do this more precisely
export const isShelleyPath = (path) => path[0] - HARDENED_THRESHOLD === 1852

// TODO: do this properly with cardano-crypto unpackAddress
export const isV1Address = (address: string) => address.startsWith('D')

export const bechAddressToHex = (address: string): HexString => {
  const parsed = bech32.decode(address)
  if (parsed.prefix !== 'addr') throw Error('Invalid address')
  return parsed.data.toString('hex')
}

export const base58AddressToHex = (address: string): HexString => {
  const parsed = base58.decode(address)
  return parsed.toString('hex')
}

export const accountAddressFromXpub = (stakeXpub: Xpub, networkId): string => {
  const addrBuffer = packRewardAddress(xpub2blake2b224Hash(stakeXpub), networkId)
  return bech32.encode({prefix: 'addr', data: addrBuffer})
}

export const accountHexAddressFromXpub = (stakeXpub: Xpub, networkId): HexString => {
  const addrBuffer = packRewardAddress(xpub2blake2b224Hash(stakeXpub), networkId)
  return Buffer.from(addrBuffer).toString('hex')
}

export const baseAddressFromXpub = (spendXpub: Xpub, stakeXpub: Xpub, networkId): string => {
  const addrBuffer = packBaseAddress(
    xpub2blake2b224Hash(spendXpub),
    xpub2blake2b224Hash(stakeXpub),
    networkId
  )
  return bech32.encode({prefix: 'addr', data: addrBuffer})
}

export const isShelleyFormat = (address: string): boolean => {
  // TODO: should we remove this?
  return address.startsWith('addr')
}

export const isBase = (address: string): boolean => {
  return getAddressType(Buffer.from(address, 'hex')) === AddressTypes.BASE
}

export const isByron = (address: string): boolean => {
  return getAddressType(Buffer.from(address, 'hex')) === AddressTypes.BOOTSTRAP
}
