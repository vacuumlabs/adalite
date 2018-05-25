const cbor = require('cbor')
const base58 = require('bs58')

const hashBlake2b256 = require('./helpers/hashBlake2b256')
const CborIndefiniteLengthArray = require('./helpers/CborIndefiniteLengthArray')

function getTxId(txAux) {
  return hashBlake2b256(txAux).toString('hex')
}

function TxAux(inputs, outputs, attributes) {
  function encodeCBOR(encoder) {
    return encoder.pushAny([
      new CborIndefiniteLengthArray(inputs),
      new CborIndefiniteLengthArray(outputs),
      attributes,
    ])
  }

  const definition = {
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

  function getCoins() {
    return utxo.coins
  }

  function encodeCBOR(encoder) {
    return encoder.pushAny([
      type,
      new cbor.Tagged(24, cbor.encode([Buffer.from(utxo.txHash, 'hex'), utxo.outputIndex])),
    ])
  }

  return {
    getCoins,
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

function HdNode({secretKey, publicKey, chainCode, hdNodeString}) {
  /**
   * HD node groups secretKey, publicKey and chainCode
   * can be initialized from Buffers or single string
   * @param secretKey as Buffer
   * @param publicKey as Buffer
   * @param chainCode as Buffer
   * @param hdNodeString as string = concat strings secretKey + publicKey + chainCode
   */
  if (hdNodeString) {
    secretKey = Buffer.from(hdNodeString.substr(0, 128), 'hex')
    publicKey = Buffer.from(hdNodeString.substr(128, 64), 'hex')
    chainCode = Buffer.from(hdNodeString.substr(192, 64), 'hex')
  }

  const extendedPublicKey = Buffer.concat([publicKey, chainCode], 64)

  return {
    secretKey,
    publicKey,
    chainCode,
    extendedPublicKey,
  }
}

function SignedTransactionStructured(txAux, witnesses) {
  function getId() {
    return getTxId(txAux)
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
  HdNode,
  SignedTransactionStructured,
  TxAux,
  TxWitness,
  getTxId,
}
