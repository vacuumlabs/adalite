// config intended to be passed on to frontend
// keys in process .env must be referencesd explicitly
// so dotenv-webpack is able to include them in the test bundle for Mocha tests

module.exports = {
  CARDANOLITE_SERVER_URL: process.env.CARDANOLITE_SERVER_URL,
  /*
  * if mocking is enabled, blockchain url is replaced with server url so the server is
  * able to intercept the requests from the frontend and mock the responses
  */
  CARDANOLITE_BLOCKCHAIN_EXPLORER_URL:
    process.env.CARDANOLITE_ENABLE_SERVER_MOCKING_MODE === 'true'
      ? process.env.CARDANOLITE_SERVER_URL
      : process.env.CARDANOLITE_BLOCKCHAIN_EXPLORER_URL,
  CARDANOLITE_WALLET_ADDRESS_LIMIT: parseInt(process.env.CARDANOLITE_WALLET_ADDRESS_LIMIT, 10),
  CARDANOLITE_DEMO_WALLET_MNEMONIC: process.env.CARDANOLITE_DEMO_WALLET_MNEMONIC,
  CARDANOLITE_ENABLE_DEBUGGING: process.env.CARDANOLITE_ENABLE_DEBUGGING === 'true',
  CARDANOLITE_ENABLE_TREZOR: !!process.env.TREZOR_CONNECT_URL,
}
