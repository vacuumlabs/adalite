/* eslint-disable no-use-before-define */
/* eslint-disable camelcase */
import {encode} from 'borc'
import {blake2b} from 'cardano-crypto.js'
import bech32 from './helpers/bech32'

const TxOutputTypeCodes = {
  SIGN_TX_OUTPUT_TYPE_ADDRESS: 1,
  SIGN_TX_OUTPUT_TYPE_PATH: 2,
}

const build_inputs = (inputs) => {
  const res = []
  inputs.forEach((index, input) => {
    res.push([input.txid, input.outputNo])
  })
  return res
}

const build_outputs = (outputs) => {
  const result = []
  outputs.forEach((index, output) => {
    result.push([output.address, TxOutputTypeCodes.SIGN_TX_OUTPUT_TYPE_ADDRESS, output.coins])
  })
  return result
}

const build_certs = (certs) => {
  const res = []
  certs.forEach((index, cert) => {
    cert.poolHash
      ? res.push([cert.type, cert.path, cert.poolHash])
      : res.push([cert.type, cert.path])
  })
  return res
}

function ShelleyTxAux(inputs, outputs, fee, ttl, certs = []) {
  function getId() {
    return blake2b(encode(ShelleyTxAux(inputs, outputs, certs, fee, ttl)), 32).toString('hex')
  }

  function encodeCBOR(encoder) {
    return encoder.pushAny({
      0: build_inputs(inputs),
      1: build_outputs(outputs),
      2: fee,
      3: ttl,
      4: build_certs(certs),
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
  const address = utxo.address // TODO: not needed?

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
    return encoder.pushAny([AddressCborWrapper(address), coins])
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
  ShelleySignedTransactionStructured,
}
