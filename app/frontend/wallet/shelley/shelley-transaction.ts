/* eslint-disable no-use-before-define */
/* eslint-disable camelcase */
import {encode, Tagged} from 'borc'
import {blake2b, base58, bech32} from 'cardano-crypto.js'
import {isShelleyFormat} from './helpers/addresses'
import {ipv4AddressToBuf, ipv6AddressToBuf} from './helpers/poolCertificateUtils'

function ShelleyTxAux(inputs, outputs, fee, ttl, certs?, withdrawals?) {
  function getId() {
    return blake2b(
      encode(ShelleyTxAux(inputs, outputs, fee, ttl, certs, withdrawals)),
      32
    ).toString('hex')
  }

  function encodeCBOR(encoder) {
    const txMap = new Map()
    txMap.set(0, inputs)
    txMap.set(1, outputs)
    txMap.set(2, fee)
    txMap.set(3, ttl)
    if (certs && certs.length) txMap.set(4, certs)
    if (withdrawals) txMap.set(5, withdrawals)
    return encoder.pushAny(txMap)
  }

  return {
    getId,
    inputs,
    outputs,
    fee,
    ttl,
    certs,
    withdrawals,
    encodeCBOR,
  }
}

function ShelleyFee(fee) {
  function encodeCBOR(encoder) {
    return encoder.pushAny(fee)
  }

  return {
    fee,
    encodeCBOR,
  }
}

function ShelleyTtl(ttl) {
  function encodeCBOR(encoder) {
    return encoder.pushAny(ttl)
  }

  return {
    ttl,
    encodeCBOR,
  }
}

function ShelleyTxWitnessShelley(publicKey, signature) {
  function encodeCBOR(encoder) {
    return encoder.pushAny([publicKey, signature])
  }

  return {
    publicKey,
    signature,
    encodeCBOR,
  }
}

function ShelleyWitdrawal(accountAddress, rewards) {
  function encodeCBOR(encoder) {
    // TODO: accountAddressHash is not a hash, it's bytes
    const accountAddressHash = bech32.decode(accountAddress).data
    const withdrawalMap = new Map()
    withdrawalMap.set(accountAddressHash, rewards)

    return encoder.pushAny(withdrawalMap)
  }
  return {
    accountAddress,
    rewards,
    address: accountAddress,
    encodeCBOR,
  }
}

function ShelleyTxWitnessByron(publicKey, signature, chaincode, address_attributes) {
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

function ShelleyTxInputFromUtxo(utxo) {
  const coins = utxo.coins // TODO: not needed?
  const txid = utxo.txHash
  const outputNo = utxo.outputIndex
  const address = utxo.address
  const txHash = Buffer.from(txid, 'hex')
  function encodeCBOR(encoder) {
    return encoder.pushAny([txHash, outputNo])
  }

  return {
    coins,
    address,
    txid,
    outputNo,
    encodeCBOR,
  }
}

function ShelleyTxOutput(address, coins, isChange, spendingPath = null, stakingPath = null) {
  function encodeCBOR(encoder) {
    const addressBuff = isShelleyFormat(address)
      ? bech32.decode(address).data
      : base58.decode(address)
    return encoder.pushAny([addressBuff, coins])
  }

  return {
    address,
    coins,
    isChange,
    spendingPath,
    stakingPath,
    encodeCBOR,
  }
}

function ShelleyTxCert(type, accountAddress, poolHash, poolParams?) {
  function encodeCBOR(encoder) {
    const accountAddressHash = accountAddress ? bech32.decode(accountAddress).data.slice(1) : null
    let hash
    if (poolHash) hash = Buffer.from(poolHash, 'hex')
    const account = [0, accountAddressHash]
    const encodedCertsTypes = {
      0: [type, account],
      1: [type, account],
      2: [type, account, hash],
      3: poolParams
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
        : [],
    }
    return encoder.pushAny(encodedCertsTypes[type])
  }

  return {
    address: accountAddress,
    type,
    accountAddress,
    poolHash,
    poolRegistrationParams: poolParams,
    encodeCBOR,
  }
}

function ShelleySignedTransactionStructured(txAux, witnesses, meta) {
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

export {
  ShelleyTxAux,
  ShelleyTxWitnessByron,
  ShelleyTxWitnessShelley,
  ShelleyTxOutput,
  ShelleyTxInputFromUtxo,
  ShelleyTxCert,
  ShelleyFee,
  ShelleyTtl,
  ShelleyWitdrawal,
  ShelleySignedTransactionStructured,
}
