// config intended to be passed on to frontend
// keys in process .env must be referencesd explicitly
// so dotenv-webpack is able to include them in the test bundle for Mocha tests
module.exports = {
  CARDANOLITE_BLOCKCHAIN_EXPLORER_URL: process.env.CARDANOLITE_BLOCKCHAIN_EXPLORER_URL,
  CARDANOLITE_TRANSACTION_SUBMITTER_URL: process.env.CARDANOLITE_TRANSACTION_SUBMITTER_URL,
  TREZOR_CONNECT_URL: process.env.TREZOR_CONNECT_URL,
  CARDANOLITE_WALLET_ADDRESS_LIMIT: parseInt(process.env.CARDANOLITE_WALLET_ADDRESS_LIMIT, 10),
}
