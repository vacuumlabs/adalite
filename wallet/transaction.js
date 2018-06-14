const cbor = require('cbor')
const base58 = require('bs58')

const hashBlake2b256 = require('./helpers/hashBlake2b256')
const CborIndefiniteLengthArray = require('./helpers/CborIndefiniteLengthArray')

function getTxId(txAux) {
  return hashBlake2b256(txAux).toString('hex')
}

function TxAux(inputs, outputs, attributes) {
  function getId() {
    return getTxId(TxAux(inputs, outputs, attributes))
  }

  function encodeCBOR(encoder) {
    return encoder.pushAny([
      new CborIndefiniteLengthArray(inputs),
      new CborIndefiniteLengthArray(outputs),
      attributes,
    ])
  }

  const definition = {
    getId,
    inputs,
    outputs,
    encodeCBOR,
  }

  return definition
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

function TxInput(utxo) {
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
  TxOutput,
  SignedTransactionStructured,
  TxAux,
  TxWitness,
}
