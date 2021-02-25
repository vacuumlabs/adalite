const cbor = require('borc')

const coinsFromOutputAmount = (outputAmount) =>
  Array.isArray(outputAmount) ? outputAmount[0] : outputAmount

const parseTxBodyOutAmount = (txBody) => {
  /*
   * The following code works because AdaLite sends 1 or 2-output txs
   * depending on the presence of change address, and the first one
   * is always the amount intended to be sent out
   * format - [txAux][outputs][0-th output][amount]
   * amount = coins | [coins, multiasset]
   */
  const outputAmount = cbor.decode(txBody)[0].get(1)[0][1]
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
