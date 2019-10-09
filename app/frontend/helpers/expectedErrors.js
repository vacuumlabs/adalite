const expectedErrors = {
  ConversationRatesError: () => '',
  TransactionCorrupted: () => '',
  ParamsValidationError: () => '',
  UnsupportedOperationError: () => '',
  TransactionRejected: () => '',
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
