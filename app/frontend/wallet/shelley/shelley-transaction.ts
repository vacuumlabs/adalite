/* eslint-disable no-use-before-define */
/* eslint-disable camelcase */
import {encode, Tagged} from 'borc'
import {blake2b, base58, bech32} from 'cardano-crypto.js'
import {isShelleyFormat} from './helpers/addresses'
import {ipv4AddressToBuf, ipv6AddressToBuf} from './helpers/poolCertificateUtils'
import {_ByronWitness, _Certificate, _Input, _Output, _ShelleyWitness, _Withdrawal} from '../types'
import {
  TxAmount,
  TxBodyKey,
  TxCertificate,
  TxCertificateKey,
  TxInput,
  TxOutput,
  TxStakeCredential,
  TxStakeCredentialType,
  TxTokens,
  TxWithdrawals,
  TxWitnessByron,
  TxWitnesses,
  TxWitnessKey,
  TxWitnessShelley,
  _TxAux,
  _TxSigned,
} from './types'
import {CertificateType, HexString, Token} from '../../types'
import {groupTokensByPolicyId} from '../helpers/tokenFormater'

function ShelleyTxAux(
  inputs: _Input[],
  outputs: _Output[],
  fee: number,
  ttl: number,
  certificates: _Certificate[],
  withdrawals: _Withdrawal[]
): _TxAux {
  function getId() {
    return blake2b(
      encode(ShelleyTxAux(inputs, outputs, fee, ttl, certificates, withdrawals)),
      32
    ).toString('hex')
  }

  function encodeCBOR(encoder) {
    const txBody = new Map<TxBodyKey, any>()
    txBody.set(TxBodyKey.INPUTS, ShelleyTxInputs(inputs))
    txBody.set(TxBodyKey.OUTPUTS, ShelleyTxOutputs(outputs))
    txBody.set(TxBodyKey.FEE, fee)
    txBody.set(TxBodyKey.TTL, ttl)
    if (certificates.length) {
      txBody.set(TxBodyKey.CERTIFICATES, ShelleyTxCertificates(certificates))
    }
    if (withdrawals.length) {
      txBody.set(TxBodyKey.WITHDRAWALS, ShelleyTxWithdrawals(withdrawals))
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

function ShelleyTxInputs(inputs: _Input[]): TxInput[] {
  const txInputs: TxInput[] = inputs.map(({txHash, outputIndex}) => {
    const txId = Buffer.from(txHash, 'hex')
    return [txId, outputIndex]
  })
  return txInputs
}

function cborizeOutputTokens(tokens: Token[]): TxTokens {
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

function cborizeTxOutput(output: _Output): TxOutput {
  const amount: TxAmount =
    output.tokens.length > 0 ? [output.coins, cborizeOutputTokens(output.tokens)] : output.coins
  // TODO: we should have one fn for decoding
  const addressBuff: Buffer = isShelleyFormat(output.address)
    ? bech32.decode(output.address).data
    : base58.decode(output.address)
  return [addressBuff, amount]
}

function ShelleyTxOutputs(outputs: _Output[]): TxOutput[] {
  const txOutputs: TxOutput[] = outputs.map(cborizeTxOutput)
  return txOutputs
}

function ShelleyTxCertificates(certificates: _Certificate[]): TxCertificate[] {
  const txCertificates: TxCertificate[] = certificates.map((certificate) => {
    // TODO: helper for getting stakingKeyHash from address
    const stakingKeyHash: Buffer = bech32.decode(certificate.stakingAddress).data.slice(1)
    // TODO: switch
    const poolHash =
      certificate.type === CertificateType.DELEGATION && Buffer.from(certificate.poolHash, 'hex')
    const stakeCredential: TxStakeCredential = [TxStakeCredentialType.ADDR_KEYHASH, stakingKeyHash]

    const encodedCertsTypes: {[key in CertificateType]: TxCertificate} = {
      [CertificateType.STAKING_KEY_REGISTRATION]: [
        TxCertificateKey.STAKING_KEY_REGISTRATION,
        stakeCredential,
      ],
      [CertificateType.STAKING_KEY_DEREGISTRATION]: [
        TxCertificateKey.STAKING_KEY_DEREGISTRATION,
        stakeCredential,
      ],
      [CertificateType.DELEGATION]: [TxCertificateKey.DELEGATION, stakeCredential, poolHash],
      [CertificateType.STAKEPOOL_REGISTRATION]: null, //ShelleyPoolRegistrationCertificate(certificate),
    }
    return encodedCertsTypes[certificate.type]
  })
  return txCertificates
}

function ShelleyTxWithdrawals(withdrawals: _Withdrawal[]): TxWithdrawals {
  const txWithdrawals: TxWithdrawals = new Map()
  withdrawals.forEach((withdrawal) => {
    const stakingAddress: Buffer = bech32.decode(withdrawal.stakingAddress).data
    txWithdrawals.set(stakingAddress, withdrawal.rewards)
  })
  return txWithdrawals
}

function TxWitnessesShelley(shelleyWitnesses: _ShelleyWitness[]): TxWitnessShelley[] {
  const txWitnessesShelley: TxWitnessShelley[] = shelleyWitnesses.map(({publicKey, signature}) => [
    publicKey,
    signature,
  ])
  return txWitnessesShelley
}

function TxWitnessesByron(byronWitnesses: _ByronWitness[]): TxWitnessByron[] {
  const txWitnessesByron: TxWitnessByron[] = byronWitnesses.map(
    ({publicKey, signature, chainCode, addressAttributes}) => [
      publicKey,
      signature,
      chainCode,
      addressAttributes,
    ]
  )
  return txWitnessesByron
}

function ShelleyTxWitnesses(
  byronWitnesses: _ByronWitness[],
  shelleyWitnesses: _ShelleyWitness[]
): TxWitnesses {
  const txWitnesses: TxWitnesses = new Map()
  if (byronWitnesses.length > 0) {
    txWitnesses.set(TxWitnessKey.BYRON, TxWitnessesByron(byronWitnesses))
  }
  if (shelleyWitnesses.length > 0) {
    txWitnesses.set(TxWitnessKey.SHELLEY, TxWitnessesShelley(shelleyWitnesses))
  }
  return txWitnesses
}

function ShelleySignedTransactionStructured(
  txAux: _TxAux,
  txWitnesses: TxWitnesses,
  txMeta: Buffer | null
): _TxSigned {
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

// function ShelleyPoolRegistrationCertificate(certificate: _Certificate) {
//   const {type, poolRegistrationParams: poolParams} = certificate
//   const txPoolRegistrationCertificate = certificate.poolRegistrationParams
//     ? [
//       type,
//       Buffer.from(poolParams.poolKeyHashHex, 'hex'),
//       Buffer.from(poolParams.vrfKeyHashHex, 'hex'),
//       parseInt(poolParams.pledgeStr, 10),
//       parseInt(poolParams.costStr, 10),
//       new Tagged(
//         30,
//         [
//           parseInt(poolParams.margin.numeratorStr, 10),
//           parseInt(poolParams.margin.denominatorStr, 10),
//         ],
//         null
//       ),
//       Buffer.from(poolParams.rewardAccountHex, 'hex'),
//       poolParams.poolOwners.map((ownerObj) => {
//         if (ownerObj.stakingKeyHashHex) {
//           return Buffer.from(ownerObj.stakingKeyHashHex, 'hex')
//         }
//         // else is a path owner and has pubKeyHex
//         return Buffer.from(ownerObj.pubKeyHex, 'hex')
//       }),
//       poolParams.relays.map((relay) => {
//         switch (relay.type) {
//           case 0:
//             return [
//               relay.type,
//               relay.params.portNumber,
//               relay.params.ipv4 ? ipv4AddressToBuf(relay.params.ipv4) : null,
//               relay.params.ipv6 ? ipv6AddressToBuf(relay.params.ipv6) : null,
//             ]
//           case 1:
//             return [relay.type, relay.params.portNumber, relay.params.dnsName]
//           case 2:
//             return [relay.type, relay.params.dnsName]
//           default:
//             return []
//         }
//       }),
//       poolParams.metadata
//         ? [
//           poolParams.metadata.metadataUrl,
//           Buffer.from(poolParams.metadata.metadataHashHex, 'hex'),
//         ]
//         : null,
//     ]
//     : []
//   return txPoolRegistrationCertificate
// }

export {
  ShelleyTxAux,
  ShelleyTxWitnesses,
  ShelleySignedTransactionStructured,
  ShelleyTxInputs,
  ShelleyTxOutputs,
  ShelleyTxCertificates,
  ShelleyTxWithdrawals,
  cborizeTxOutput,
}
