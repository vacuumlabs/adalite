import bech32 from './bech32'
import {
  packBaseAddress,
  packRewardsAccountAddress,
  getAddressInfo,
  AddressTypes,
  base58,
} from 'cardano-crypto.js'

const xpub2pub = (xpub: Buffer) => xpub.slice(0, 32)

type Xpub = Buffer

export const bechAddressToHex = (address: string) => {
  const parsed = bech32.decode(address)
  if (parsed.prefix !== 'addr') throw Error('Invalid address')
  return parsed.data.toString('hex')
}

export const base58AddressToHex = (address: string) => {
  const parsed = base58.decode(address)
  return parsed.toString('hex')
}

export const accountAddressFromXpub = (stakeXpub: Xpub, networkId) => {
  const addrBuffer = packRewardsAccountAddress(xpub2pub(stakeXpub), 14, networkId)
  return bech32.encode({prefix: 'addr', data: addrBuffer})
}

export const baseAddressFromXpub = (spendXpub: Xpub, stakeXpub: Xpub, networkId) => {
  const addrBuffer = packBaseAddress(xpub2pub(spendXpub), xpub2pub(stakeXpub), 0, networkId)
  return bech32.encode({prefix: 'addr', data: addrBuffer})
}

export const isShelleyAddress = (address) => {
  const addressType = getAddressInfo(Buffer.from(address, 'hex')).addressType
  return (
    addressType === AddressTypes.BASE ||
    addressType === AddressTypes.ENTERPRISE ||
    addressType === AddressTypes.POINTER ||
    addressType === AddressTypes.REWARDS
  )
}

export const isShelleyFormat = (address: string): boolean => {
  return address.startsWith('addr1')
}

export const isBase = (address: string): boolean => {
  return getAddressInfo(Buffer.from(address, 'hex')).addressType === AddressTypes.BASE
}

export const isByron = (address: string): boolean => {
  return getAddressInfo(Buffer.from(address, 'hex')).addressType === AddressTypes.BOOTSTRAP
}
