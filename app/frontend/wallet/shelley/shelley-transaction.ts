import * as cbor from 'borc'
import {blake2b, base58, bech32} from 'cardano-crypto.js'
import {isShelleyFormat} from './helpers/addresses'
// import {ipv4AddressToBuf, ipv6AddressToBuf} from './helpers/poolCertificateUtils'
import {
  TxByronWitness,
  TxCertificate,
  TxDelegationCert,
  TxInput,
  TxOutput,
  TxShelleyWitness,
  TxStakepoolRegistrationCert,
  TxStakingKeyDeregistrationCert,
  TxStakingKeyRegistrationCert,
  TxWithdrawal,
} from '../types'
import {
  CborizedTxAmount,
  TxBodyKey,
  CborizedTxCertificate,
  TxCertificateKey,
  CborizedTxInput,
  CborizedTxOutput,
  CborizedTxStakeCredential,
  TxStakeCredentialType,
  CborizedTxTokens,
  CborizedTxWithdrawals,
  CborizedTxWitnessByron,
  CborizedTxWitnesses,
  TxWitnessKey,
  CborizedTxWitnessShelley,
  TxAux,
  CborizedTxSignedStructured,
  CborizedTxStakingKeyRegistrationCert,
  CborizedTxStakingKeyDeregistrationCert,
  CborizedTxDelegationCert,
  CborizedTxStakepoolRegistrationCert,
} from './types'
import {CertificateType, HexString, Token} from '../../types'
import {groupTokensByPolicyId} from '../helpers/tokenFormater'
import NamedError from '../../helpers/NamedError'
import {ipv4AddressToBuf, ipv6AddressToBuf} from './helpers/poolCertificateUtils'

function ShelleyTxAux(
  inputs: TxInput[],
  outputs: TxOutput[],
  fee: number,
  ttl: number,
  certificates: TxCertificate[],
  withdrawals: TxWithdrawal[]
): TxAux {
  function getId() {
    return blake2b(
      cbor.encode(ShelleyTxAux(inputs, outputs, fee, ttl, certificates, withdrawals)),
      32
    ).toString('hex')
  }

  function encodeCBOR(encoder) {
    const txBody = new Map<TxBodyKey, any>()
    txBody.set(TxBodyKey.INPUTS, cborizeTxInputs(inputs))
    txBody.set(TxBodyKey.OUTPUTS, cborizeTxOutputs(outputs))
    txBody.set(TxBodyKey.FEE, fee)
    txBody.set(TxBodyKey.TTL, ttl)
    if (certificates.length) {
      txBody.set(TxBodyKey.CERTIFICATES, cborizeTxCertificates(certificates))
    }
    if (withdrawals.length) {
      txBody.set(TxBodyKey.WITHDRAWALS, cborizeTxWithdrawals(withdrawals))
    }
    return encoder.pushAny(txBody)
  }

  return {
    getId,
    inputs,
    outputs,
    fee,
    ttl,
    certificates,
    withdrawals,
    encodeCBOR,
  }
}

function cborizeTxInputs(inputs: TxInput[]): CborizedTxInput[] {
  const txInputs: CborizedTxInput[] = inputs.map(({txHash, outputIndex}) => {
    const txId = Buffer.from(txHash, 'hex')
    return [txId, outputIndex]
  })
  return txInputs
}

function cborizeTxOutputTokens(tokens: Token[]): CborizedTxTokens {
  const policyIdMap = new Map<Buffer, Map<Buffer, number>>()
  const tokenObject = groupTokensByPolicyId(tokens)
  Object.entries(tokenObject).forEach(([policyId, assets]) => {
    const assetMap = new Map<Buffer, number>()
    assets.forEach(({assetName, quantity}) => {
      assetMap.set(Buffer.from(assetName, 'hex'), quantity)
    })
    policyIdMap.set(Buffer.from(policyId, 'hex'), assetMap)
  })
  return policyIdMap
}

function cborizeSingleTxOutput(output: TxOutput): CborizedTxOutput {
  const amount: CborizedTxAmount =
    output.tokens.length > 0 ? [output.coins, cborizeTxOutputTokens(output.tokens)] : output.coins
  // TODO: we should have one fn for decoding
  const addressBuff: Buffer = isShelleyFormat(output.address)
    ? bech32.decode(output.address).data
    : base58.decode(output.address)
  return [addressBuff, amount]
}

function cborizeTxOutputs(outputs: TxOutput[]): CborizedTxOutput[] {
  const txOutputs: CborizedTxOutput[] = outputs.map(cborizeSingleTxOutput)
  return txOutputs
}

function cborizeStakingKeyRegistrationCert(
  certificate: TxStakingKeyRegistrationCert
): CborizedTxStakingKeyRegistrationCert {
  const stakingKeyHash: Buffer = bech32.decode(certificate.stakingAddress).data.slice(1)
  const stakeCredential: CborizedTxStakeCredential = [
    TxStakeCredentialType.ADDR_KEYHASH,
    stakingKeyHash,
  ]
  return [TxCertificateKey.STAKING_KEY_REGISTRATION, stakeCredential]
}

function cborizeStakingKeyDeregistrationCert(
  certificate: TxStakingKeyDeregistrationCert
): CborizedTxStakingKeyDeregistrationCert {
  const stakingKeyHash: Buffer = bech32.decode(certificate.stakingAddress).data.slice(1)
  const stakeCredential: CborizedTxStakeCredential = [
    TxStakeCredentialType.ADDR_KEYHASH,
    stakingKeyHash,
  ]
  return [TxCertificateKey.STAKING_KEY_DEREGISTRATION, stakeCredential]
}

function cborizeDelegationCert(certificate: TxDelegationCert): CborizedTxDelegationCert {
  const stakingKeyHash: Buffer = bech32.decode(certificate.stakingAddress).data.slice(1)
  const stakeCredential: CborizedTxStakeCredential = [
    TxStakeCredentialType.ADDR_KEYHASH,
    stakingKeyHash,
  ]
  const poolHash = Buffer.from(certificate.poolHash, 'hex')
  return [TxCertificateKey.DELEGATION, stakeCredential, poolHash]
}

function cborizeStakepoolRegistrationCert(
  certificate: TxStakepoolRegistrationCert
): CborizedTxStakepoolRegistrationCert {
  const {poolRegistrationParams} = certificate
  return [
    TxCertificateKey.STAKEPOOL_REGISTRATION,
    Buffer.from(poolRegistrationParams.poolKeyHashHex, 'hex'),
    Buffer.from(poolRegistrationParams.vrfKeyHashHex, 'hex'),
    parseInt(poolRegistrationParams.pledgeStr, 10),
    parseInt(poolRegistrationParams.costStr, 10),
    new cbor.Tagged(
      30,
      [
        parseInt(poolRegistrationParams.margin.numeratorStr, 10),
        parseInt(poolRegistrationParams.margin.denominatorStr, 10),
      ],
      null
    ),
    Buffer.from(poolRegistrationParams.rewardAccountHex, 'hex'),
    poolRegistrationParams.poolOwners.map((ownerObj) => {
      return Buffer.from(ownerObj.stakingKeyHashHex, 'hex')
    }),
    poolRegistrationParams.relays.map((relay) => {
      // TODO: enum for relays
      switch (relay.type) {
        case 0:
          return [
            relay.type,
            relay.params.portNumber,
            relay.params.ipv4 ? ipv4AddressToBuf(relay.params.ipv4) : null,
            relay.params.ipv6 ? ipv6AddressToBuf(relay.params.ipv6) : null,
          ]
        case 1:
          return [relay.type, relay.params.portNumber, relay.params.dnsName]
        case 2:
          return [relay.type, relay.params.dnsName]
        default:
          return []
      }
    }),
    poolRegistrationParams.metadata
      ? [
        poolRegistrationParams.metadata.metadataUrl,
        Buffer.from(poolRegistrationParams.metadata.metadataHashHex, 'hex'),
      ]
      : null,
  ]
}

function cborizeTxCertificates(certificates: TxCertificate[]): CborizedTxCertificate[] {
  const txCertificates = certificates.map((certificate) => {
    switch (certificate.type) {
      case CertificateType.STAKING_KEY_REGISTRATION:
        return cborizeStakingKeyRegistrationCert(certificate)
      case CertificateType.STAKING_KEY_DEREGISTRATION:
        return cborizeStakingKeyDeregistrationCert(certificate)
      case CertificateType.DELEGATION:
        return cborizeDelegationCert(certificate)
      case CertificateType.STAKEPOOL_REGISTRATION:
        return cborizeStakepoolRegistrationCert(certificate)
      default:
        throw NamedError('InvalidCertificateType')
    }
  })
  return txCertificates
}

function cborizeTxWithdrawals(withdrawals: TxWithdrawal[]): CborizedTxWithdrawals {
  const txWithdrawals: CborizedTxWithdrawals = new Map()
  withdrawals.forEach((withdrawal) => {
    const stakingAddress: Buffer = bech32.decode(withdrawal.stakingAddress).data
    txWithdrawals.set(stakingAddress, withdrawal.rewards)
  })
  return txWithdrawals
}

function cborizeTxWitnessesShelley(
  shelleyWitnesses: TxShelleyWitness[]
): CborizedTxWitnessShelley[] {
  const txWitnessesShelley: CborizedTxWitnessShelley[] = shelleyWitnesses.map(
    ({publicKey, signature}) => [publicKey, signature]
  )
  return txWitnessesShelley
}

function cborizeTxWitnessesByron(byronWitnesses: TxByronWitness[]): CborizedTxWitnessByron[] {
  const txWitnessesByron: CborizedTxWitnessByron[] = byronWitnesses.map(
    ({publicKey, signature, chainCode, addressAttributes}) => [
      publicKey,
      signature,
      chainCode,
      addressAttributes,
    ]
  )
  return txWitnessesByron
}

function cborizeTxWitnesses(
  byronWitnesses: TxByronWitness[],
  shelleyWitnesses: TxShelleyWitness[]
): CborizedTxWitnesses {
  const txWitnesses: CborizedTxWitnesses = new Map()
  if (byronWitnesses.length > 0) {
    txWitnesses.set(TxWitnessKey.BYRON, cborizeTxWitnessesByron(byronWitnesses))
  }
  if (shelleyWitnesses.length > 0) {
    txWitnesses.set(TxWitnessKey.SHELLEY, cborizeTxWitnessesShelley(shelleyWitnesses))
  }
  return txWitnesses
}

function ShelleySignedTransactionStructured(
  txAux: TxAux,
  txWitnesses: CborizedTxWitnesses,
  txMeta: Buffer | null
): CborizedTxSignedStructured {
  function getId(): HexString {
    return txAux.getId()
  }

  function encodeCBOR(encoder) {
    return encoder.pushAny([txAux, txWitnesses, txMeta])
  }

  return {
    getId,
    encodeCBOR,
  }
}

export {
  ShelleyTxAux,
  cborizeTxWitnesses,
  cborizeTxWitnessesShelley,
  ShelleySignedTransactionStructured,
  cborizeTxInputs,
  cborizeTxOutputs,
  cborizeTxCertificates,
  cborizeTxWithdrawals,
  cborizeSingleTxOutput,
}
