const expectedErrors = {
  ConversationRatesError: () => '',
  TransactionCorrupted: () => '',
  ParamsValidationError: () => '',
  NoSupportError: () => '', // unsupported operationError makes more sense
  TransactionRejected: () => '', //txRejectedByUser d make more sense
  CoinFeeError: () => '',
  NetworkError: () => '',
}

function isExpected(e) {
  return !!expectedErrors[e.name]
}

module.exports = {
  isExpected,
}
