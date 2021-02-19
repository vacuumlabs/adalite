/* eslint-disable no-use-before-define */
/* eslint-disable camelcase */
import {encode, Tagged} from 'borc'
import {blake2b, base58, bech32} from 'cardano-crypto.js'
import {isShelleyFormat} from './helpers/addresses'
import {ipv4AddressToBuf, ipv6AddressToBuf} from './helpers/poolCertificateUtils'
import {_Certificate, _Input, _Output, _Withdrawal} from '../types'
import {
  TxBodyKey,
  TxCertificate,
  TxInput,
  TxOutput,
  TxWithdrawals,
  _TxAux,
  _TxSigned,
  _TxWitnessByron,
  _TxWitnessShelley,
} from './types'
import {Lovelace} from '../../types'

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
    if (withdrawals.length) txBody.set(TxBodyKey.WITHDRAWALS, ShelleyTxWithdrawals(withdrawals))
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

function ShelleyTxOutputs(outputs: _Output[]): TxOutput[] {
  const txOutputs: TxOutput[] = outputs.map((output) => {
    // TODO: we should have one fn for decoding
    const addressBuff: Buffer = isShelleyFormat(output.address)
      ? bech32.decode(output.address).data
      : base58.decode(output.address)
    return [addressBuff, output.coins]
  })
  return txOutputs
}

function ShelleyTxCertificates(certificates: _Certificate[]): TxCertificate[] {
  const txCertificates: TxCertificate[] = certificates.map((certificate) => {
    const accountAddressHash: Buffer = bech32.decode(certificate.stakingAddress).data
    const hash = certificate.poolHash && Buffer.from(certificate.poolHash, 'hex')
    const account = [0, accountAddressHash]
    const encodedCertsTypes = {
      0: [certificate.type, account],
      1: [certificate.type, account],
      2: [certificate.type, account, hash],
      // 3: ShelleyPoolRegistrationCertificate(certificate),
    }
    return encodedCertsTypes[certificate.type]
  })
  return txCertificates
}

function ShelleyTxWithdrawals(withdrawals: _Withdrawal[]): TxWithdrawals {
  const txWithdrawals: TxWithdrawals = new Map<Buffer, Lovelace>()
  withdrawals.forEach((withdrawal) => {
    const stakingAddress: Buffer = bech32.decode(withdrawal.stakingAddress).data
    txWithdrawals.set(stakingAddress, withdrawal.rewards)
  })
  return txWithdrawals
}

function ShelleyTxWitnessShelley(publicKey: Buffer, signature: Buffer): _TxWitnessShelley {
  function encodeCBOR(encoder) {
    return encoder.pushAny([publicKey, signature])
  }

  return {
    publicKey,
    signature,
    encodeCBOR,
  }
}

function ShelleyTxWitnessByron(
  publicKey: Buffer,
  signature: Buffer,
  chaincode: Buffer,
  address_attributes: any
): _TxWitnessByron {
  function encodeCBOR(encoder) {
    return encoder.pushAny([publicKey, signature, chaincode, address_attributes])
  }

  return {
    publicKey,
    signature,
    chaincode,
    address_attributes,
    encodeCBOR,
  }
}

function ShelleySignedTransactionStructured(
  txAux: _TxAux,
  witnesses: any,
  meta: Buffer | null
): _TxSigned {
  function getId() {
    return txAux.getId()
  }

  function encodeCBOR(encoder) {
    return encoder.pushAny([txAux, witnesses, meta])
  }

  return {
    getId,
    witnesses,
    txAux,
    encodeCBOR,
  }
}

function ShelleyPoolRegistrationCertificate(certificate: _Certificate) {
  const {type, poolRegistrationParams: poolParams} = certificate
  const txPoolRegistrationCertificate = certificate.poolRegistrationParams
    ? [
      type,
      Buffer.from(poolParams.poolKeyHashHex, 'hex'),
      Buffer.from(poolParams.vrfKeyHashHex, 'hex'),
      parseInt(poolParams.pledgeStr, 10),
      parseInt(poolParams.costStr, 10),
      new Tagged(
        30,
        [
          parseInt(poolParams.margin.numeratorStr, 10),
          parseInt(poolParams.margin.denominatorStr, 10),
        ],
        null
      ),
      Buffer.from(poolParams.rewardAccountHex, 'hex'),
      poolParams.poolOwners.map((ownerObj) => {
        if (ownerObj.stakingKeyHashHex) {
          return Buffer.from(ownerObj.stakingKeyHashHex, 'hex')
        }
        // else is a path owner and has pubKeyHex
        return Buffer.from(ownerObj.pubKeyHex, 'hex')
      }),
      poolParams.relays.map((relay) => {
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
      poolParams.metadata
        ? [
          poolParams.metadata.metadataUrl,
          Buffer.from(poolParams.metadata.metadataHashHex, 'hex'),
        ]
        : null,
    ]
    : []
  return txPoolRegistrationCertificate
}

export {
  ShelleyTxAux,
  ShelleyTxWitnessByron,
  ShelleyTxWitnessShelley,
  ShelleySignedTransactionStructured,
  ShelleyTxInputs,
  ShelleyTxOutputs,
  ShelleyTxCertificates,
  ShelleyTxWithdrawals,
}
