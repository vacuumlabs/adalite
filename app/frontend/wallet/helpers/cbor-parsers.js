const cbor = require('borc')
const base58 = require('cardano-crypto.js').base58

const {
  TxInputFromUtxo,
  TxOutput,
  TxAux,
  SignedTransactionStructured,
  TxWitness,
} = require('../transaction')

const parseTxHash = (val) => Buffer.from(val).toString('hex')

const parseAddress = (val) => {
  return base58.encode(cbor.encode(val))
}

const parseTxInput = (val) => {
  const type = val[0]
  const inputAttributes = cbor.decode(val[1].value)
  const txHash = parseTxHash(inputAttributes[0])
  const outputIndex = inputAttributes[1]

  const utxo = {
    type,
    txHash,
    outputIndex,
  }
  return TxInputFromUtxo(utxo)
}

const parseTxOutput = (val) => {
  const address = parseAddress(val[0])
  const coins = val[1]
  const isChange = false

  return TxOutput(address, coins, isChange)
}

const parseTxWitness = (val) => {
  const witnessAttributes = cbor.decode(val[1].value)
  const extendedPubicKey = witnessAttributes[0]
  const signature = witnessAttributes[1]

  return TxWitness(extendedPubicKey, signature)
}
/*
 * expects raw cbor in buffer as input, returns parsed transaction as TxAux type
 * WARNING: the utxo attribute of returned TxInputs is incomplete (missing coins and address)
 * since these are not present in serialised transaction
 */
const parseTxAux = (txAuxRaw) => {
  const decoded = cbor.decode(txAuxRaw)
  const txInputsRaw = decoded[0]
  const txInputs = txInputsRaw.map(parseTxInput)

  const txOutputsRaw = decoded[1]
  const txOutputs = txOutputsRaw.map(parseTxOutput)

  const txAttributes = decoded[2]

  return TxAux(txInputs, txOutputs, txAttributes)
}

/*
 * expects whole transaction body as raw cbor input, outputs SignedTransactionStructured type
 * WARNING: the utxo attribute of returned TxInputs is incomplete (missing coins and address)
 * since these are not present in serialised transaction
 */
const parseTx = (txRaw) => {
  const decoded = cbor.decode(txRaw)
  const txAuxRaw = decoded[0]
  const txInputsRaw = txAuxRaw[0]
  const txInputs = txInputsRaw.map(parseTxInput)

  const txOutputsRaw = txAuxRaw[1]
  const txOutputs = txOutputsRaw.map(parseTxOutput)

  const txAttributes = txAuxRaw[2]

  const txWitnessesRaw = decoded[1]
  const txWitnesses = txWitnessesRaw.map(parseTxWitness)

  return SignedTransactionStructured(TxAux(txInputs, txOutputs, txAttributes), txWitnesses)
}

module.exports = {
  parseTxAux,
  parseTx,
}
