import {blake2b, base58, bech32} from 'cardano-crypto.js'
import {encodeCbor, decodeCbor, Tagged as CborTagged} from '../helpers/cbor'
import {isShelleyFormat} from './helpers/addresses'
import {
  TxAuxiliaryData,
  TxByronWitness,
  TxCertificate,
  TxDelegationCert,
  TxPlanAuxiliaryData,
  TxPlanVotingAuxiliaryData,
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
  CborizedTxTokenBundle,
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
  TxSigned,
  CborizedCliWitness,
  CborizedVotingRegistrationMetadata,
} from './types'
import {CertificateType, HexString, TokenBundle} from '../../types'
import {UnexpectedError, UnexpectedErrorReason} from '../../errors'
import {ipv4AddressToBuf, ipv6AddressToBuf, TxRelayType} from './helpers/poolCertificateUtils'
import {orderTokenBundle} from '../helpers/tokenFormater'
import BigNumber from 'bignumber.js'

function ShelleyTxAux({
  inputs,
  outputs,
  fee,
  ttl,
  certificates,
  withdrawals,
  auxiliaryDataHash,
  auxiliaryData,
  validityIntervalStart,
}: {
  inputs: TxInput[]
  outputs: TxOutput[]
  fee: BigNumber
  ttl: BigNumber | null
  certificates: TxCertificate[]
  withdrawals: TxWithdrawal[]
  auxiliaryDataHash: HexString | null
  auxiliaryData: TxAuxiliaryData | null
  validityIntervalStart: BigNumber | null
}): TxAux {
  function getId() {
    return blake2b(
      encodeCbor(
        ShelleyTxAux({
          inputs,
          outputs,
          fee,
          ttl,
          certificates,
          withdrawals,
          auxiliaryDataHash,
          auxiliaryData,
          validityIntervalStart,
        })
      ),
      32
    ).toString('hex')
  }

  function encodeCBOR(encoder) {
    const txBody = new Map<TxBodyKey, any>()
    txBody.set(TxBodyKey.INPUTS, cborizeTxInputs(inputs))
    txBody.set(TxBodyKey.OUTPUTS, cborizeTxOutputs(outputs))
    txBody.set(TxBodyKey.FEE, BigInt(fee.toString()))
    if (ttl !== null) {
      txBody.set(TxBodyKey.TTL, BigInt(ttl.toString()))
    }
    if (certificates.length) {
      txBody.set(TxBodyKey.CERTIFICATES, cborizeTxCertificates(certificates))
    }
    if (withdrawals.length) {
      txBody.set(TxBodyKey.WITHDRAWALS, cborizeTxWithdrawals(withdrawals))
    }
    if (auxiliaryDataHash) {
      txBody.set(TxBodyKey.AUXILIARY_DATA_HASH, Buffer.from(auxiliaryDataHash, 'hex'))
    }
    if (validityIntervalStart !== null) {
      txBody.set(TxBodyKey.VALIDITY_INTERVAL_START, BigInt(validityIntervalStart.toString()))
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
    auxiliaryDataHash,
    auxiliaryData,
    validityIntervalStart,
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

function cborizeTxOutputTokenBundle(tokenBundle: TokenBundle): CborizedTxTokenBundle {
  const policyIdMap = new Map<Buffer, Map<Buffer, BigInt>>()
  const orderedTokenBundle = orderTokenBundle(tokenBundle)
  orderedTokenBundle.forEach(({policyId, assets}) => {
    const assetMap = new Map<Buffer, BigInt>()
    assets.forEach(({assetName, quantity}) => {
      assetMap.set(Buffer.from(assetName, 'hex'), BigInt(quantity.toString()))
    })
    policyIdMap.set(Buffer.from(policyId, 'hex'), assetMap)
  })
  return policyIdMap
}

function cborizeSingleTxOutput(output: TxOutput): CborizedTxOutput {
  const amount: CborizedTxAmount =
    output.tokenBundle.length > 0
      ? [BigInt(output.coins.toString()), cborizeTxOutputTokenBundle(output.tokenBundle)]
      : BigInt(output.coins.toString())
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
    new CborTagged(30, [
      parseInt(poolRegistrationParams.margin.numeratorStr, 10),
      parseInt(poolRegistrationParams.margin.denominatorStr, 10),
    ]),
    Buffer.from(poolRegistrationParams.rewardAccountHex, 'hex'),
    poolRegistrationParams.poolOwners.map((ownerObj) => {
      return Buffer.from(ownerObj.stakingKeyHashHex, 'hex')
    }),
    poolRegistrationParams.relays.map((relay) => {
      switch (relay.type) {
        case TxRelayType.SINGLE_HOST_IP:
          return [
            relay.type,
            relay.params.portNumber,
            relay.params.ipv4 ? ipv4AddressToBuf(relay.params.ipv4) : null,
            relay.params.ipv6 ? ipv6AddressToBuf(relay.params.ipv6) : null,
          ]
        case TxRelayType.SINGLE_HOST_NAME:
          return [relay.type, relay.params.portNumber, relay.params.dnsName]
        case TxRelayType.MULTI_HOST_NAME:
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
        throw new UnexpectedError(UnexpectedErrorReason.InvalidCertificateType)
    }
  })
  return txCertificates
}

function cborizeTxWithdrawals(withdrawals: TxWithdrawal[]): CborizedTxWithdrawals {
  const txWithdrawals: CborizedTxWithdrawals = new Map()
  withdrawals.forEach((withdrawal) => {
    const stakingAddress: Buffer = bech32.decode(withdrawal.stakingAddress).data
    txWithdrawals.set(stakingAddress, BigInt(withdrawal.rewards.toString()))
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
  txAuxiliaryData: CborizedVotingRegistrationMetadata | null
): CborizedTxSignedStructured {
  function getId(): HexString {
    return txAux.getId()
  }

  function encodeCBOR(encoder) {
    return encoder.pushAny([
      txAux,
      txWitnesses,
      true, // isValid field required since Alonzo era
      txAuxiliaryData,
    ])
  }

  return {
    getId,
    encodeCBOR,
  }
}

function cborizeCliWitness(txSigned: TxSigned): CborizedCliWitness {
  const [, witnesses]: [any, CborizedTxWitnesses] = decodeCbor(txSigned.txBody)
  // there can be only one witness since only one signing file was passed
  const [key, [data]] = Array.from(witnesses)[0]
  return [key, data]
}

const cborizeTxVotingRegistration = ({
  votingPubKey,
  stakePubKey,
  rewardDestinationAddress,
  nonce,
}: TxPlanVotingAuxiliaryData): [number, Map<number, Buffer | BigInt>] => [
  61284,
  new Map<number, Buffer | BigInt>([
    [1, Buffer.from(votingPubKey, 'hex')],
    [2, Buffer.from(stakePubKey, 'hex')],
    [3, bech32.decode(rewardDestinationAddress.address).data],
    [4, Number(nonce)],
  ]),
]

const cborizeTxAuxiliaryVotingData = (
  txAuxiliaryData: TxPlanAuxiliaryData,
  signatureHex: string
): CborizedVotingRegistrationMetadata => [
  new Map<number, Map<number, Buffer | BigInt>>([
    cborizeTxVotingRegistration(txAuxiliaryData),
    [61285, new Map<number, Buffer>([[1, Buffer.from(signatureHex, 'hex')]])],
  ]),
  [],
]

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
  cborizeCliWitness,
  cborizeTxVotingRegistration,
  cborizeTxAuxiliaryVotingData,
}
