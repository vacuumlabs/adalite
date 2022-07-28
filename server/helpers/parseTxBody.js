const cbor = require('cbor')

const coinsFromOutputValue = (outputValue) =>
  // converting to number as BigInts don't support division/mixing with Number which may
  // result in errors and the additional precision isn't critical for our usecase (statistics)
  Number(Array.isArray(outputValue) ? outputValue[0] : outputValue)

const parseValueFromOutput = (out) =>
  out instanceof Map
    ? out.get(1) // babbage-era
    : out[1] // pre-babbage

const parseTxBodyOutAmount = (txBody) => {
  /*
   * The following code works because AdaLite sends 1 or 2-output txs
   * depending on the presence of change address, and the first one
   * is always the amount intended to be sent out
   * format - [txAux]{1: outputs}[0-th output][amount]}
   * amount = coins | [coins, multiasset] | {1: coins} | {1: [coins, multiasset]}
   * see https://github.com/input-output-hk/cardano-ledger/blob/master/eras/babbage/test-suite/cddl-files/babbage.cddl#L75
   */
  const firstTxOutput = cbor.decode(txBody)[0].get(1)[0]
  const outputValue = firstTxOutput ? parseValueFromOutput(firstTxOutput) : 0
  return coinsFromOutputValue(outputValue)
}

const parseTxBodyTotalAmount = (txBody) => {
  return cbor
    .decode(txBody)[0]
    .get(1)
    .reduce(
      (acc, curr) => acc + coinsFromOutputValue(parseValueFromOutput(curr)),
      0
    )
}

module.exports = {
  parseTxBodyOutAmount,
  parseTxBodyTotalAmount,
}
