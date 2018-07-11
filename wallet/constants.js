module.exports = {
  HARDENED_THRESHOLD: 0x80000000,
  MAX_INT32: 2147483647,
  MAX_ADDRESS_INFO_AGE: 10000,
  /*
  * "011a2d964a095820" is a magic prefix from the cardano-sl code
  * the "01" byte is a constant to denote signatures of transactions
  * the "1a2d964a09" part is the CBOR representation of the blockchain-specific magic constant
  * the "5820" part is the CBOR prefix for a hex string
  */
  TX_SIGN_MESSAGE_PREFIX: '011a2d964a095820',

  // There are currently derivation modes 1 and 2. Daedalus uses derivation mode 1, so do we
  CARDANO_KEY_DERIVATION_MODE: 1,
}
