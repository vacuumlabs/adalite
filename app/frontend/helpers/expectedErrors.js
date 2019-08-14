const expectedErrors = new Set([
  'ConversationRatesError',
  'TransactionCorrupted',
  'ParamsValidationError',
  'UnsupportedOperationError',
  'TransactionRejected',
  'CoinFeeError',
  'NetworkError',
  'TransportStatusError',
  'TrezorError',
  'TransactionRejectedByNetwork',
])

function isExpected(e) {
  return expectedErrors.has(e.name)
}

module.exports = {
  isExpected,
}
