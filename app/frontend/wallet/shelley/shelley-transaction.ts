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
    if (input.type === 'utxo') {
      res.push([input.txid, input.outputNo])
    }
  })
  return res
}

const build_outputs = (outputs) => {
  const result = []
  outputs.forEach((index, output) => {
    result.push([output.address, 1, output.coins])
  })
  return result
}

function ShelleyTxAux(inputs, outputs, fee, ttl) {
  function getId() {
    return blake2b(encode(ShelleyTxAux(inputs, outputs, fee, ttl)), 32).toString('hex')
  }

  function encodeCBOR(encoder) {
    return encoder.pushAny({
      0: build_inputs(inputs),
      1: build_outputs(outputs),
      2: fee,
      3: ttl,
    })
  }

  return {
    getId,
    inputs,
    outputs,
    fee,
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
  const coins = utxo.coins
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
    return encoder.pushAny([AddressCborWrapper(address), coins])
  }

  return {
    address,
    coins,
    isChange,
    encodeCBOR,
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
    return encoder.pushAny([txAux, witnesses]) //TODO: cert
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
  ShelleySignedTransactionStructured,
}
