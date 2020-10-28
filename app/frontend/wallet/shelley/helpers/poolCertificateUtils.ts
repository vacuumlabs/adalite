import NamedError from '../../../helpers/NamedError'
import {buf2hex} from './chainlib-wrapper.ts'

const enum PoolParamsByteLengths {
  POOL_HASH = 28,
  VRF = 32,
  IPV4 = 4,
  IPV6 = 16,
  OWNER = 28,
  REWARD = 29,
  METADATA_HASH = 32,
}

export type PoolOwnerParams = {
  stakingPath?: any //BIP32Path
  stakingKeyHashHex?: string
}

export type SingleHostIPRelay = {
  portNumber?: number
  ipv4?: string
  ipv6?: string
}

export type SingleHostNameRelay = {
  portNumber?: number
  dnsName: string
}

export type MultiHostNameRelay = {
  dnsName: string
}

export type RelayParams = {
  type: number // single host ip = 0, single hostname = 1, multi host name = 2
  params: SingleHostIPRelay | SingleHostNameRelay | MultiHostNameRelay
}

export type PoolMetadataParams = {
  metadataUrl: string
  metadataHashHex: string
}

export type Margin = {
  numeratorStr: string
  denominatorStr: string
}

export type PoolParams = {
  poolKeyHashHex: string
  vrfKeyHashHex: string
  pledgeStr: string
  costStr: string
  margin: Margin
  rewardAccountHex: string
  poolOwners: Array<PoolOwnerParams>
  relays: Array<RelayParams>
  metadata: PoolMetadataParams
}

const buf2hexLengthCheck = (buffer, correctByteLength, variableName) => {
  if (!Buffer.isBuffer(buffer) || Buffer.byteLength(buffer) !== correctByteLength) {
    throw NamedError('PoolRegIncorrectBufferLength', {message: variableName})
  }
  return buf2hex(buffer)
}

const checkNumber = (number, variableName) => {
  if (!Number.isInteger(number)) {
    throw NamedError('PoolRegInvalidNumber', {message: variableName})
  }
  return number
}

const transformPoolOwners = (poolOwners, ownerCredentials) => {
  const hexOwners: Array<string> = poolOwners.map((owner) =>
    buf2hexLengthCheck(owner, PoolParamsByteLengths.OWNER, 'Owner key hash')
  )
  const constainsDuplicates = new Set(hexOwners).size !== hexOwners.length
  if (constainsDuplicates) {
    throw NamedError('PoolRegDuplicateOwners')
  }

  let isWalletTheOwner = false
  const transformedOwners = hexOwners.map((owner) => {
    if (owner === ownerCredentials.pubKeyHex) {
      isWalletTheOwner = true
      return {
        stakingPath: ownerCredentials.path,
        pubKeyHex: ownerCredentials.pubKeyHex, // retain key hex for inverse operation
      }
    }
    return {stakingKeyHashHex: owner}
  })

  if (!isWalletTheOwner) {
    throw NamedError('PoolRegNotTheOwner')
  }
  return transformedOwners
}

const transformMargin = (marginObj) => {
  if (
    !marginObj ||
    !marginObj.denominator ||
    !marginObj.numerator ||
    !checkNumber(marginObj.numerator, 'Numerator') ||
    !checkNumber(marginObj.denominator, 'Denominator') ||
    marginObj.numerator > marginObj.denominator
  ) {
    throw NamedError('PoolRegInvalidMargin')
  }
  return {
    numeratorStr: marginObj.numerator.toString(),
    denominatorStr: marginObj.denominator.toString(),
  }
}

const ipv4BufToAddress = (ipv4Buf) => {
  buf2hexLengthCheck(ipv4Buf, PoolParamsByteLengths.IPV4, 'Ipv4 Relay')
  return Array.from(new Uint8Array(ipv4Buf)).join('.')
}

const ipv6BufToAddress = (ipv6Buf) => {
  const copy = Buffer.from(ipv6Buf)
  const endianSwappedBuf = copy.swap32()
  const ipv6Hex = buf2hexLengthCheck(endianSwappedBuf, PoolParamsByteLengths.IPV6, 'Ipv6 Relay')
  const ipv6AddressSemicolons = ipv6Hex.replace(/(.{4})/g, '$1:').slice(0, -1)
  return ipv6AddressSemicolons
}

export const ipv4AddressToBuf = (ipv4Address: string) => {
  const splitAddressNumbers = ipv4Address.split('.').map((x) => +x)
  return Buffer.from(splitAddressNumbers)
}

export const ipv6AddressToBuf = (ipv6Address: string) => {
  const ipv6NoSemicolons = ipv6Address.replace(/:/g, '')
  const ipv6Buf = Buffer.from(ipv6NoSemicolons, 'hex')
  const copy = Buffer.from(ipv6Buf)
  const endianSwappedBuf = copy.swap32()
  return endianSwappedBuf
}

const transformRelays = (relays) =>
  relays.map((relay) => {
    let params
    switch (relay.type) {
      case 0:
        params = {
          portNumber: checkNumber(relay.portNumber, 'Port number'),
          ipv4: relay.ipv4 ? ipv4BufToAddress(relay.ipv4) : null,
          ipv6: relay.ipv6 ? ipv6BufToAddress(relay.ipv6) : null,
        }
        break
      case 1:
        params = {
          portNumber: checkNumber(relay.portNumber, 'Port number'),
          dnsName: relay.dnsName,
        }
        break
      case 2:
        params = {
          dnsName: relay.dnsName,
        }
        break
      default:
        throw NamedError('PoolRegInvalidRelay')
    }
    return {
      type: relay.type,
      params,
    }
  })

const transformMetadata = (metadata) => {
  if (!metadata) {
    return null
  }
  if (!metadata.metadataHash || !metadata.metadataUrl) {
    throw NamedError('PoolRegInvalidMetadata')
  }
  return {
    metadataUrl: metadata.metadataUrl,
    metadataHashHex: buf2hexLengthCheck(
      metadata.metadataHash,
      PoolParamsByteLengths.METADATA_HASH,
      'Metadata hash'
    ),
  }
}

export const transformPoolParamsTypes = (
  {
    type,
    poolKeyHash,
    vrfPubKeyHash,
    pledge,
    cost,
    margin,
    rewardAddress,
    poolOwnersPubKeyHashes,
    relays,
    metadata,
  },
  ownerCredentials
) => ({
  poolKeyHashHex: buf2hexLengthCheck(poolKeyHash, PoolParamsByteLengths.POOL_HASH, 'Pool key hash'),
  vrfKeyHashHex: buf2hexLengthCheck(vrfPubKeyHash, PoolParamsByteLengths.VRF, 'VRF key hash'),
  pledgeStr: checkNumber(pledge, 'Pledge').toString(),
  costStr: checkNumber(cost, 'Fixed cost').toString(),
  margin: transformMargin(margin),
  rewardAccountHex: buf2hexLengthCheck(
    rewardAddress,
    PoolParamsByteLengths.REWARD,
    'Reward account'
  ),
  poolOwners: transformPoolOwners(poolOwnersPubKeyHashes, ownerCredentials),
  relays: transformRelays(relays),
  metadata: transformMetadata(metadata),
})
