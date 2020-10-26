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
  ipv4Hex?: string
  ipv6Hex?: string
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
  rewardAccountKeyHash: string
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
    !marginObj.value ||
    marginObj.value.length !== 2 ||
    marginObj.value.some((e) => typeof e !== 'number' || marginObj.value[1] > marginObj.value[0])
  ) {
    throw NamedError('PoolRegInvalidMargin')
  }
  return {
    numeratorStr: checkNumber(marginObj.value[0], 'Numerator').toString(),
    denominatorStr: checkNumber(marginObj.value[1], 'Denominator').toString(),
  }
}

const transformRelays = (relays) =>
  relays.map((relay) => {
    let params
    switch (relay[0]) {
      case 0:
        params = {
          portNumber: relay[1] ? checkNumber(relay[1], 'Port number') : null,
          ipv4Hex: relay[2]
            ? buf2hexLengthCheck(relay[2], PoolParamsByteLengths.IPV4, 'Ipv4 Relay')
            : null,
          ipv6Hex: relay[3]
            ? buf2hexLengthCheck(relay[3], PoolParamsByteLengths.IPV6, 'Ipv6 Relay')
            : null,
        }
        break
      case 1:
        params = {
          portNumber: relay[1] ? checkNumber(relay[1], 'Port number') : null,
          dnsName: relay[2],
        }
        break
      case 2:
        params = {
          dnsName: relay[1],
        }
        break
      default:
        throw NamedError('PoolRegInvalidRelay')
    }
    return {
      type: relay[0],
      params,
    }
  })

const transformMetadata = (metadata) => {
  if (metadata.length === 0) {
    return null
  }
  if (metadata.length !== 2) {
    throw NamedError('PoolRegInvalidMetadata')
  }
  return {
    metadataUrl: metadata.length ? metadata[0] : null,
    metadataHashHex: metadata.length
      ? buf2hexLengthCheck(metadata[1], PoolParamsByteLengths.METADATA_HASH, 'Metadata hash')
      : null,
  }
}

export const transformPoolParamsTypes = (
  {
    type,
    poolKeyHashHex,
    vrfKeyHashHex,
    pledgeStr,
    costStr,
    margin,
    rewardAccountKeyHash,
    poolOwners,
    relays,
    metadata,
  },
  ownerCredentials
) => ({
  poolKeyHashHex: buf2hexLengthCheck(
    poolKeyHashHex,
    PoolParamsByteLengths.POOL_HASH,
    'Pool key hash'
  ),
  vrfKeyHashHex: buf2hexLengthCheck(vrfKeyHashHex, PoolParamsByteLengths.VRF, 'VRF key hash'),
  pledgeStr: checkNumber(pledgeStr, 'Pledge').toString(),
  costStr: checkNumber(costStr, 'Fixed cost').toString(),
  margin: transformMargin(margin),
  rewardAccountKeyHash: buf2hexLengthCheck(
    rewardAccountKeyHash,
    PoolParamsByteLengths.REWARD,
    'Reward account'
  ),
  poolOwners: transformPoolOwners(poolOwners, ownerCredentials),
  relays: transformRelays(relays),
  metadata: transformMetadata(metadata),
})
