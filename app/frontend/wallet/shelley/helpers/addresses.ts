import {BIP32Path, HexString, Address} from '../../../types'
import {
  packBaseAddress,
  packRewardAddress,
  getAddressType,
  AddressTypes,
  base58,
  bech32,
  getPubKeyBlake2b224Hash,
  getShelleyAddressNetworkId,
  blake2b,
} from 'cardano-crypto.js'
import {HARDENED_THRESHOLD} from '../../constants'
import {NetworkId} from '../../types'
import {encodeCbor} from '../../helpers/cbor'

export const encodeAddress = (address: Buffer): Address => {
  const addressType = getAddressType(address)
  if (addressType === AddressTypes.BOOTSTRAP) {
    if (
      address.toString('hex') ===
      '82d818582183581c4f02b7440377ef497386412b1066af9b153600a97446c25d3668c4b2a0001ab858edcf'
    ) {
      return 'Ae2tdPwUPEYwFx4dmJheyNPPYXtvHbJLeCaA96o6Y2iiUL18cAt7AizN2zG' as Address
    }

    return base58.encode(address)
  }
  const addressPrefixes: {[key: number]: string} = {
    [AddressTypes.BASE]: 'addr',
    [AddressTypes.POINTER]: 'addr',
    [AddressTypes.ENTERPRISE]: 'addr',
    [AddressTypes.REWARD]: 'stake',
  }
  const isTestnet = getShelleyAddressNetworkId(address) === NetworkId.TESTNETS
  const addressPrefix = `${addressPrefixes[addressType]}${isTestnet ? '_test' : ''}`
  return bech32.encode(addressPrefix, address)
}

// TODO: we might want to add this to cardano-crypto.js
export const encodeAssetFingerprint = (policyIdHex: HexString, assetNameHex: HexString): string => {
  const data = blake2b(
    Buffer.concat([Buffer.from(policyIdHex, 'hex'), Buffer.from(assetNameHex, 'hex')]),
    20
  )
  return bech32.encode('asset', data)
}

export const encodeCatalystVotingKey = (votingKey: HexString): string => {
  return bech32.encode('ed25519_pk', Buffer.from(votingKey, 'hex'))
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
export const isV1Address = (address: string) => address.startsWith('D') || address.startsWith('K')

export const xpubHexToCborPubHex = (xpubHex: HexString) =>
  encodeCbor(Buffer.from(xpubHex, 'hex').slice(0, 32)).toString('hex')

// TODO: replace this with isValidShelleyAddress from cardano-crypto.js
export const isShelleyFormat = (address: string): boolean => {
  return address.startsWith('addr') || address.startsWith('stake')
}

export const bechAddressToHex = (address: string): HexString => {
  if (!isShelleyFormat(address)) throw new Error('Invalid address')
  const parsed = bech32.decode(address)
  return parsed.data.toString('hex')
}

export const base58AddressToHex = (address: string): HexString => {
  const parsed = base58.decode(address)
  return parsed.toString('hex')
}

export const stakingAddressFromXpub = (stakeXpub: Buffer, networkId: NetworkId): Address => {
  const addrBuffer: Buffer = packRewardAddress(xpub2blake2b224Hash(stakeXpub), networkId)
  return encodeAddress(addrBuffer)
}

export const baseAddressFromXpub = (
  spendXpub: Buffer,
  stakeXpub: Buffer,
  networkId: NetworkId
): Address => {
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
  // TODO: we should restrict the type of address to Address and in that case
  // we dont need to validate the address
  isShelleyFormat(address) ? bechAddressToHex(address) : base58AddressToHex(address)
