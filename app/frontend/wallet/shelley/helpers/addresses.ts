import bech32 from './bech32'
import {
  packBaseAddress,
  packRewardsAccountAddress,
  getAddressInfo,
  AddressTypes,
  base58,
} from 'cardano-crypto.js'
import {HARDENED_THRESHOLD} from '../../constants'

type HexString = string // TODO: specify

const xpub2pub = (xpub: Buffer) => xpub.slice(0, 32)

type Xpub = Buffer

// TODO: do this more precisely
export const isShelleyPath = (path) => path[0] - HARDENED_THRESHOLD === 1852

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
  const addrBuffer = packRewardsAccountAddress(xpub2pub(stakeXpub), 14, networkId)
  return bech32.encode({prefix: 'addr', data: addrBuffer})
}

export const accountHexAddressFromXpub = (stakeXpub: Xpub, networkId): HexString => {
  const addrBuffer = packRewardsAccountAddress(xpub2pub(stakeXpub), 14, networkId)
  return Buffer.from(addrBuffer).toString('hex')
}

export const baseAddressFromXpub = (spendXpub: Xpub, stakeXpub: Xpub, networkId): string => {
  const addrBuffer = packBaseAddress(xpub2pub(spendXpub), xpub2pub(stakeXpub), 0, networkId)
  return bech32.encode({prefix: 'addr', data: addrBuffer})
}

export const isShelleyAddress = (address): boolean => {
  try {
    const addressType = getAddressInfo(Buffer.from(address, 'hex')).addressType
    return (
      addressType === AddressTypes.BASE ||
      addressType === AddressTypes.ENTERPRISE ||
      addressType === AddressTypes.POINTER ||
      addressType === AddressTypes.REWARDS
    )
  } catch (e) {
    return false
  }
}

export const isShelleyFormat = (address: string): boolean => {
  return address.startsWith('addr')
}

export const isValidShelleyAddress = (address: string): boolean => {
  try {
    return isShelleyFormat(address) && isShelleyAddress(bechAddressToHex(address))
  } catch (e) {
    return false
  }
}

export const isBase = (address: string): boolean => {
  return getAddressInfo(Buffer.from(address, 'hex')).addressType === AddressTypes.BASE
}

export const isByron = (address: string): boolean => {
  return getAddressInfo(Buffer.from(address, 'hex')).addressType === AddressTypes.BOOTSTRAP
}
