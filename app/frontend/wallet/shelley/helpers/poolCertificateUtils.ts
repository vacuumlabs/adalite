import {
  TxRelayTypes,
  _Margin,
  _PoolRelay,
  _StakepoolRegistrationCert,
} from '../../../helpers/cliParser/types'
import {InternalError, InternalErrorReason} from '../../../errors'

export type TxPoolParams = {
  poolKeyHashHex: string // Hex
  vrfKeyHashHex: string
  pledgeStr: string
  costStr: string
  margin: TxStakepoolMargin
  rewardAccountHex: string
  poolOwners: TxStakepoolOwner[]
  relays: TxStakepoolRelay[]
  metadata: TxStakepoolMetadata
}

export const enum TxRelayType {
  SINGLE_HOST_IP = 0,
  SINGLE_HOST_NAME = 1,
  MULTI_HOST_NAME = 2,
}

const enum PoolParamsByteLengths {
  POOL_HASH = 28,
  VRF = 32,
  IPV4 = 4,
  IPV6 = 16,
  OWNER = 28,
  REWARD = 29,
  METADATA_HASH = 32,
}

export type TxStakepoolOwner = {
  stakingKeyHashHex?: string
}

export type TxStakepoolRelay = SingleHostIPRelay | SingleHostNameRelay | MultiHostNameRelay

type SingleHostIPRelay = {
  type: TxRelayType.SINGLE_HOST_IP
  params: {
    portNumber?: number
    ipv4?: string
    ipv6?: string
  }
}

type SingleHostNameRelay = {
  type: TxRelayType.SINGLE_HOST_NAME
  params: {
    portNumber?: number
    dnsName: string
  }
}

type MultiHostNameRelay = {
  type: TxRelayType.MULTI_HOST_NAME
  params: {
    dnsName: string
  }
}

type TxStakepoolMetadata = {
  metadataUrl: string
  metadataHashHex: string
}

type TxStakepoolMargin = {
  numeratorStr: string
  denominatorStr: string
}

// TODO: remove when migrating to BigInt
// cli tool supports bigint and adalite doesnt so we need to restrict it
export const ensureIsSafeInt = (value: BigInt | number, variableName: string): number => {
  const valueType = typeof value
  if (valueType !== 'bigint' && valueType !== 'number') {
    throw new Error(`${variableName} has invalid type ${valueType}.`)
  }
  const valueNumber = Number(value)
  if (!Number.isInteger(valueNumber)) {
    throw new Error(`${variableName} is not a valid integer.`)
  }
  if (valueNumber > Number.MAX_SAFE_INTEGER || valueNumber < Number.MIN_SAFE_INTEGER) {
    throw new Error(
      `${variableName} value is too big. Numbers bigger than ${Number.MAX_SAFE_INTEGER} are not supported.`
    )
  }
  return valueNumber
}

const buf2hexLengthCheck = (buffer: Buffer, correctByteLength: number, variableName: string) => {
  if (!Buffer.isBuffer(buffer) || Buffer.byteLength(buffer) !== correctByteLength) {
    throw new InternalError(InternalErrorReason.PoolRegIncorrectBufferLength, {
      message: variableName,
    })
  }
  return buffer.toString('hex')
}

const parseStakepoolOwners = (poolOwners: Buffer[]): TxStakepoolOwner[] => {
  const hexOwners: Array<string> = poolOwners.map((owner) =>
    buf2hexLengthCheck(owner, PoolParamsByteLengths.OWNER, 'Owner key hash')
  )
  const constainsDuplicates = new Set(hexOwners).size !== hexOwners.length
  if (constainsDuplicates) {
    throw new InternalError(InternalErrorReason.PoolRegDuplicateOwners)
  }

  return hexOwners.map((owner) => {
    return {stakingKeyHashHex: owner}
  })
}

const parseStakepoolMargin = (marginObj: _Margin): TxStakepoolMargin => {
  if (
    !marginObj ||
    !marginObj.hasOwnProperty('denominator') ||
    !marginObj.hasOwnProperty('numerator') ||
    marginObj.numerator < 0 ||
    marginObj.denominator <= 0 ||
    marginObj.numerator > marginObj.denominator
  ) {
    throw new InternalError(InternalErrorReason.PoolRegInvalidMargin)
  }
  return {
    numeratorStr: marginObj.numerator.toString(),
    denominatorStr: marginObj.denominator.toString(),
  }
}

const ipv4BufToAddress = (ipv4Buf: Buffer) => {
  buf2hexLengthCheck(ipv4Buf, PoolParamsByteLengths.IPV4, 'Ipv4 Relay')
  return Array.from(new Uint8Array(ipv4Buf)).join('.')
}

const ipv6BufToAddress = (ipv6Buf: Buffer) => {
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

const parseStakepoolRelays = (relays: _PoolRelay[]): TxStakepoolRelay[] =>
  relays.map((relay) => {
    switch (relay.type) {
      case TxRelayTypes.SINGLE_HOST_IP:
        return {
          type: TxRelayType.SINGLE_HOST_IP,
          params: {
            portNumber: relay.portNumber,
            ipv4: relay.ipv4 ? ipv4BufToAddress(relay.ipv4) : undefined,
            ipv6: relay.ipv6 ? ipv6BufToAddress(relay.ipv6) : undefined,
          },
        }
      case TxRelayTypes.SINGLE_HOST_NAME:
        return {
          type: TxRelayType.SINGLE_HOST_NAME,
          params: {
            portNumber: relay.portNumber,
            dnsName: relay.dnsName || '',
          },
        }
      case TxRelayTypes.MULTI_HOST_NAME:
        return {
          type: TxRelayType.MULTI_HOST_NAME,
          params: {
            dnsName: relay.dnsName || '',
          },
        }
      default:
        throw new InternalError(InternalErrorReason.PoolRegInvalidRelay)
    }
  })

const parseStakepoolMetadata = (metadata: {metadataUrl: string; metadataHash: Buffer} | null) => {
  if (!metadata) {
    return {metadataUrl: '', metadataHashHex: ''}
  }
  if (!metadata.metadataHash || !metadata.metadataUrl) {
    throw new InternalError(InternalErrorReason.PoolRegInvalidMetadata)
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

export const parseStakepoolRegistrationCertificate = ({
  poolKeyHash,
  vrfPubKeyHash,
  pledge,
  cost,
  margin,
  rewardAddress,
  poolOwnersPubKeyHashes,
  relays,
  metadata,
}: _StakepoolRegistrationCert): TxPoolParams => ({
  poolKeyHashHex: buf2hexLengthCheck(poolKeyHash, PoolParamsByteLengths.POOL_HASH, 'Pool key hash'),
  vrfKeyHashHex: buf2hexLengthCheck(vrfPubKeyHash, PoolParamsByteLengths.VRF, 'VRF key hash'),
  pledgeStr: ensureIsSafeInt(pledge, 'Pledge').toString(),
  costStr: ensureIsSafeInt(cost, 'Fixed cost').toString(),
  margin: parseStakepoolMargin(margin),
  rewardAccountHex: buf2hexLengthCheck(
    rewardAddress,
    PoolParamsByteLengths.REWARD,
    'Reward account'
  ),
  poolOwners: parseStakepoolOwners(poolOwnersPubKeyHashes),
  relays: parseStakepoolRelays(relays),
  metadata: parseStakepoolMetadata(metadata),
})
