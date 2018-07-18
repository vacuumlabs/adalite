const cbor = require('cbor')
const base58 = require('cardano-crypto.js').base58

const {TxInput, TxOutput, TxAux} = require('../transaction')

const parseTxHash = (val) => Buffer.from(val).toString('hex')

const parseAddress = (val) => {
  return base58.encode(cbor.encode(val))
}

const parseTxInput = (val) => {
  const type = val[0]

  const inputAttributes = cbor.decode(val[1].value)
  const txHash = parseTxHash(inputAttributes[0])
  const outputIndex = inputAttributes[1]

  return TxInput(type, txHash, outputIndex)
}

const parseTxOutput = (val) => {
  const address = parseAddress(val[0])
  const coins = val[1]
  const isChange = false

  return TxOutput(address, coins, isChange)
}

const parseTxAux = (val) => {
  const txInputsRaw = val[0]
  const txInputs = txInputsRaw.map(parseTxInput)

  const txOutputsRaw = val[1]
  const txOutputs = txOutputsRaw.map(parseTxOutput)

  const txAttributes = val[2]

  return TxAux(txInputs, txOutputs, txAttributes)
}

module.exports = {
  parseTxAux,
}
