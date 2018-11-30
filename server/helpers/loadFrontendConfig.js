// config intended to be passed on to frontend
// keys in process .env must be referencesd explicitly
// so dotenv-webpack is able to include them in the test bundle for Mocha tests

// process.env.npm_package_version is undefined on Heroku
const appVersion = require('../../package.json').version

module.exports = {
  ADALITE_SERVER_URL: process.env.ADALITE_SERVER_URL,
  /*
  * if mocking is enabled, blockchain url is replaced with server url so the server is
  * able to intercept the requests from the frontend and mock the responses
  */
  ADALITE_BLOCKCHAIN_EXPLORER_URL:
    process.env.ADALITE_ENABLE_SERVER_MOCKING_MODE === 'true'
      ? process.env.ADALITE_SERVER_URL
      : process.env.ADALITE_BLOCKCHAIN_EXPLORER_URL,
  ADALITE_WALLET_ADDRESS_LIMIT: parseInt(process.env.ADALITE_WALLET_ADDRESS_LIMIT, 10),
  ADALITE_DEMO_WALLET_MNEMONIC: process.env.ADALITE_DEMO_WALLET_MNEMONIC,
  ADALITE_ENABLE_DEBUGGING: process.env.ADALITE_ENABLE_DEBUGGING === 'true',
  ADALITE_ENABLE_TREZOR: !!process.env.ADALITE_ENABLE_TREZOR,
  ADALITE_APP_VERSION: appVersion,
  ADALITE_LOGOUT_AFTER: process.env.ADALITE_LOGOUT_AFTER,
  TREZOR_CONNECT_URL: process.env.TREZOR_CONNECT_URL,
}
