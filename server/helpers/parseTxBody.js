const cbor = require('borc')

const coinsFromOutputAmount = (outputAmount) =>
  Array.isArray(outputAmount) ? outputAmount[0] : outputAmount

const parseTxBodyOutAmount = (txBody) => {
  /*
   * The following code works because AdaLite sends 1 or 2-output txs
   * depending on the presence of change address, and the first one
   * is always the amount intended to be sent out
   * format - [txAux]{1: outputs}[0-th output][amount]}
   * amount = coins | [coins, multiasset]
   */
  const firstTxOutput = cbor.decode(txBody)[0].get(1)[0]
  const outputAmount = firstTxOutput ? firstTxOutput[1] : 0
  return coinsFromOutputAmount(outputAmount)
}

const parseTxBodyTotalAmount = (txBody) => {
  return cbor
    .decode(txBody)[0]
    .get(1)
    .reduce((acc, curr) => acc + coinsFromOutputAmount(curr[1]), 0)
}

module.exports = {
  parseTxBodyOutAmount,
  parseTxBodyTotalAmount,
}
