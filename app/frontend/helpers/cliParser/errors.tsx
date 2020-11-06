/* eslint-disable max-len */
enum Errors {
  TxInputParseError = 'Failed to parse input',
  TxOutputParseError = 'Failed to parse output',
  WithrawalsParseError = 'Failed to parse withdrawals',
  TxStakingKeyRegistrationCertParseError = 'Failed to parse staking key registration certificate',
  TxStakingKeyDeregistrationCertParseError = 'Failed to parse staking key deregistration certificate',
  TxDelegationCertParseError = 'Failed to parse delegation certificate',
  TxStakepoolRegistrationCertParseError = 'Failed to parse stakepool registration certificate',
  TxSingleHostIPRelayParseError = 'Failed to parse single host IP relay',
  TxSingleHostNameRelayParseError = 'Failed to parse single host name relay',
  TxMultiHostNameRelayParseError = 'Failed to parse multi host name relay',
  UnsupportedRelayTypeError = 'Unsupported relay type',
  UnsupportedCertificateTypeError = 'Unsupported certificate type',
}

export {Errors}
