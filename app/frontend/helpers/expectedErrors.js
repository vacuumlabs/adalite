const expectedErrors = {
  ConversationRatesError: () => '',
  TransactionCorrupted: () => '',
  ParamsValidationError: () => '',
  NoSupportError: () => '', // unsupported operationError makes more sense
  TransactionRejected: () => '', //txRejectedByUser d make more sense
  CoinFeeError: () => '',
  NetworkError: () => '',
  TransportStatusError: () => '',
  TrezorError: () => '',
  TransactionRejectedByNetwork: () => '',
}

function isExpected(e) {
  return !!expectedErrors[e.name]
}

module.exports = {
  isExpected,
}
