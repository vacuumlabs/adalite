const cbor = require('borc')
const {blake2b, base58} = require('cardano-crypto.js')

const CborIndefiniteLengthArray = require('./helpers/CborIndefiniteLengthArray')

function TxAux(inputs, outputs, attributes) {
  function getId() {
    return blake2b(cbor.encode(TxAux(inputs, outputs, attributes)), 32).toString('hex')
  }

  function encodeCBOR(encoder) {
    return encoder.pushAny([
      new CborIndefiniteLengthArray(inputs),
      new CborIndefiniteLengthArray(outputs),
      attributes,
    ])
  }

  return {
    getId,
    inputs,
    outputs,
    attributes,
    encodeCBOR,
  }
}

function TxWitness(extendedPublicKey, signature) {
  // default - PkWitness
  const type = 0

  function encodeCBOR(encoder) {
    return encoder.pushAny([type, new cbor.Tagged(24, cbor.encode([extendedPublicKey, signature]))])
  }

  return {
    extendedPublicKey,
    signature,
    encodeCBOR,
  }
}

function TxInputFromUtxo(utxo) {
  // default input type
  const type = 0
  const coins = utxo.coins
  const txHash = utxo.txHash
  const outputIndex = utxo.outputIndex

  function encodeCBOR(encoder) {
    return encoder.pushAny([
      type,
      new cbor.Tagged(24, cbor.encode([Buffer.from(txHash, 'hex'), outputIndex])),
    ])
  }

  return {
    coins,
    txHash,
    outputIndex,
    utxo,
    encodeCBOR,
  }
}

function TxInput(type, txHash, outputIndex) {
  function encodeCBOR(encoder) {
    return encoder.pushAny([
      type,
      new cbor.Tagged(24, cbor.encode([Buffer.from(txHash, 'hex'), outputIndex])),
    ])
  }

  return {
    type,
    txHash,
    outputIndex,
    encodeCBOR,
  }
}

function TxOutput(address, coins, isChange) {
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
    return encoder.push(base58.decode(address))
  }

  return {
    address,
    encodeCBOR,
  }
}

function SignedTransactionStructured(txAux, witnesses) {
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

module.exports = {
  TxInput,
  TxInputFromUtxo,
  TxOutput,
  SignedTransactionStructured,
  TxAux,
  TxWitness,
}
