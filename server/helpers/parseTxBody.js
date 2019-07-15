const cbor = require('borc')

const parseTxBodyOutAmount = (txBody) => {
  /*
   * The following code works because AdaLite sends 1 or 2-output txs
   * depending on the presence of change address, and the first one
   * is always the amount intended to be sent out
   * format - [txAux][outputs][0-th output][amount]
   */
  return cbor.decode(txBody)[0][1][0][1]
}

const parseTxBodyTotalAmount = (txBody) => {
  // reduce along decodedTxBody[0][1][i-th output][1] to sum all outputs
  return cbor.decode(txBody)[0][1].reduce((acc, curr) => acc + curr[1], 0)
}

module.exports = {
  parseTxBodyOutAmount,
  parseTxBodyTotalAmount,
}
