/* eslint-disable no-use-before-define */
/* eslint-disable camelcase */
import {encode} from 'borc'
import {blake2b} from 'cardano-crypto.js'
import bech32 from './helpers/bech32'

const TxOutputTypeCodes = {
  SIGN_TX_OUTPUT_TYPE_ADDRESS: 1,
  SIGN_TX_OUTPUT_TYPE_PATH: 2,
}

function ShelleyTxAux(inputs, outputs, fee, ttl, certs = []) {
  function getId() {
    return blake2b(encode(ShelleyTxAux(inputs, outputs, fee, ttl, certs)), 32).toString('hex')
  }

  function encodeCBOR(encoder) {
    return encoder.pushAny({
      0: inputs,
      1: outputs,
      2: fee,
      3: ttl,
      4: certs,
    })
  }

  return {
    getId,
    inputs,
    outputs,
    fee,
    ttl,
    certs,
    encodeCBOR,
  }
}

function ShelleyFee(fee) {
  function encodeCBOR(encoder) {
    return encoder.pushAny([fee])
  }

  return {
    fee,
    encodeCBOR,
  }
}

function ShelleyTtl(ttl) {
  function encodeCBOR(encoder) {
    return encoder.pushAny([ttl])
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

  function encodeCBOR(encoder) {
    return encoder.pushAny([txid, outputNo])
  }

  return {
    coins,
    address,
    txid,
    outputNo,
    encodeCBOR,
  }
}

function ShelleyTxOutput(address, coins, isChange) {
  function encodeCBOR(encoder) {
    return encoder.pushAny([
      AddressCborWrapper(address),
      TxOutputTypeCodes.SIGN_TX_OUTPUT_TYPE_ADDRESS,
      coins,
    ])
  }

  return {
    address,
    coins,
    isChange,
    encodeCBOR,
  }
}

function ShelleyTxCert(type, accountPath, poolHash) {
  function encodeCBOR(encoder) {
    return poolHash
      ? encoder.pushAny([type, accountPath, poolHash])
      : encoder.pushAny([type, accountPath])
  }

  return {
    encodeCBOR,
    type,
    accountPath,
    poolHash,
  }
}

function AddressCborWrapper(address) {
  function encodeCBOR(encoder) {
    return encoder.push(bech32.decode(address).data)
  }

  return {
    address,
    encodeCBOR,
  }
}

function ShelleySignedTransactionStructured(txAux, witnesses) {
  function getId() {
    return txAux.getId()
  }

  function encodeCBOR(encoder) {
    return encoder.pushAny([txAux, witnesses])
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
  ShelleySignedTransactionStructured,
}
