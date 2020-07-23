/* eslint-disable no-use-before-define */
/* eslint-disable camelcase */
import {encode} from 'borc'
import {blake2b} from 'cardano-crypto.js'

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
    result.push([output.address, output.value])
  })
  return result
}

const build_witnesses = (inputs, tx_body_hash, sign, network) => {
  const shelley_witnesses = build_shelley_witnesses(inputs, tx_body_hash, sign)
  const byron_witnesses = build_byron_witnesses(inputs, tx_body_hash, sign, network)

  const witnesses = {}
  if (shelley_witnesses.length > 0) {
    witnesses[0] = shelley_witnesses
  }
  if (byron_witnesses.length > 0) {
    witnesses[2] = byron_witnesses
  }

  return witnesses
}

const build_shelley_witnesses = (inputs, tx_body_hash, sign) => {
  const shelley_witnesses = []
  inputs.forEach((index, input) => {
    const signature = sign(tx_body_hash, input.path)
    shelley_witnesses.push([input.pubKey, signature])
  })

  return shelley_witnesses
}

const build_byron_witnesses = (inputs, tx_body_hash, sign, network) => {
  const byron_witnesses = []
  inputs.forEach((index, input) => {
    const signature = sign(tx_body_hash, input.path)
    const address_attributes = encode(
      input.protocolMagic === network.protocolMagic ? {} : {2: encode(input.protocolMagic)}
    )
    byron_witnesses.push([input.pubKey, signature, input.chaincode, address_attributes])
  })

  return byron_witnesses
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
  // default input type
  const type = utxo.type
  const value = utxo.coins
  const txid = utxo.txHash
  const outputNo = utxo.outputIndex
  const path = utxo.path
  const pubKey = utxo.pubKey
  const protocolMagic = utxo.protocolMagic
  const chaincode = utxo.chaincode

  function encodeCBOR(encoder) {
    return encoder.pushAny([txid, outputNo])
  }

  return {
    type,
    value,
    txid,
    outputNo,
    path,
    pubKey,
    protocolMagic,
    chaincode,
  }
}

function ShelleyTxInputFromAccount(account_input) {
  // default input type
  const type = account_input.typ
  const value = account_input.coins
  const accountCounter = account_input.accountCounter
  const pubKey = account_input.pubKey
  const path = account_input.path

  function encodeCBOR(encoder) {
    return encoder.pushAny(null) //TODO: account inputs cant be serialised yet
  }

  return {
    type,
    value,
    accountCounter,
    pubKey,
    path,
  }
}

function ShelleySignedTransactionStructured(txAux, witnesses) {
  function getId() {
    return txAux.getId()
  }

  function encodeCBOR(encoder) {
    return encoder.pushAny([txAux, witnesses, null]) //TODO: cert
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
  ShelleyTxInputFromAccount,
  ShelleyTxInputFromUtxo,
  ShelleySignedTransactionStructured,
  build_witnesses,
}
