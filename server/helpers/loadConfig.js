// config intended to be passed on to frontend
// keys in process .env must be referencesd explicitly
// so dotenv-webpack is able to include them in the test bundle for Mocha tests
const check = require('check-types')
const isBoolString = require('./isBoolStr')

// process.env.npm_package_version is undefined on Heroku
const appVersion = require('../../package.json').version

const {
  ADALITE_ENABLE_DEBUGGING,
  ADALITE_SERVER_URL,
  ADALITE_BLOCKCHAIN_EXPLORER_URL,
  ADALITE_DEFAULT_ADDRESS_COUNT,
  ADALITE_GAP_LIMIT,
  ADALITE_DEMO_WALLET_MNEMONIC,
  ADALITE_ENABLE_TREZOR,
  ADALITE_LOGOUT_AFTER,
  ADALITE_ENABLE_SERVER_MOCKING_MODE,
  ADALITE_MOCK_TX_SUBMISSION_SUCCESS,
  ADALITE_MOCK_TX_SUMMARY_SUCCESS,
  TREZOR_CONNECT_URL,
  REDIS_URL,
  STATS_PWD,
  PORT,
} = process.env

const checkMap = check.map(
  {
    ADALITE_ENABLE_DEBUGGING,
    ADALITE_SERVER_URL,
    ADALITE_BLOCKCHAIN_EXPLORER_URL,
    ADALITE_DEFAULT_ADDRESS_COUNT: parseInt(ADALITE_DEFAULT_ADDRESS_COUNT, 10),
    ADALITE_GAP_LIMIT: parseInt(ADALITE_GAP_LIMIT, 10),
    ADALITE_DEMO_WALLET_MNEMONIC,
    ADALITE_ENABLE_TREZOR,
    ADALITE_LOGOUT_AFTER: parseInt(ADALITE_LOGOUT_AFTER, 10),
    ADALITE_ENABLE_SERVER_MOCKING_MODE,
    ADALITE_MOCK_TX_SUBMISSION_SUCCESS,
    ADALITE_MOCK_TX_SUMMARY_SUCCESS,
  },
  {
    ADALITE_ENABLE_DEBUGGING: isBoolString,
    ADALITE_SERVER_URL: check.nonEmptyString,
    ADALITE_BLOCKCHAIN_EXPLORER_URL: check.nonEmptyString,
    ADALITE_DEFAULT_ADDRESS_COUNT: check.positive,
    ADALITE_GAP_LIMIT: check.positive,
    ADALITE_DEMO_WALLET_MNEMONIC: check.nonEmptyString,
    ADALITE_ENABLE_TREZOR: isBoolString,
    ADALITE_LOGOUT_AFTER: check.positive,
    ADALITE_ENABLE_SERVER_MOCKING_MODE: isBoolString,
    ADALITE_MOCK_TX_SUBMISSION_SUCCESS: isBoolString,
    ADALITE_MOCK_TX_SUMMARY_SUCCESS: isBoolString,
  }
)

if (!check.all(checkMap)) {
  // eslint-disable-next-line no-console
  console.log(checkMap)
  throw new Error('Invalid environment variables')
}

const frontendConfig = {
  ADALITE_SERVER_URL,
  /*
  * if mocking is enabled, blockchain url is replaced with server url so the server is
  * able to intercept the requests from the frontend and mock the responses
  */
  ADALITE_BLOCKCHAIN_EXPLORER_URL:
    ADALITE_ENABLE_SERVER_MOCKING_MODE === 'true'
      ? ADALITE_SERVER_URL
      : ADALITE_BLOCKCHAIN_EXPLORER_URL,
  ADALITE_DEFAULT_ADDRESS_COUNT: parseInt(ADALITE_DEFAULT_ADDRESS_COUNT, 10),
  ADALITE_GAP_LIMIT: parseInt(ADALITE_GAP_LIMIT, 10),
  ADALITE_DEMO_WALLET_MNEMONIC,
  ADALITE_ENABLE_DEBUGGING: ADALITE_ENABLE_DEBUGGING === 'true',
  ADALITE_ENABLE_TREZOR: !!ADALITE_ENABLE_TREZOR,
  ADALITE_APP_VERSION: appVersion,
  ADALITE_LOGOUT_AFTER,
  TREZOR_CONNECT_URL,
}

const backendConfig = {
  STATS_PWD,
  REDIS_URL,
  TREZOR_CONNECT_URL,
  ADALITE_ENABLE_SERVER_MOCKING_MODE,
  ADALITE_MOCK_TX_SUBMISSION_SUCCESS,
  ADALITE_MOCK_TX_SUMMARY_SUCCESS,
  ADALITE_BLOCKCHAIN_EXPLORER_URL,
  ADALITE_SERVER_URL,
  PORT,
}

module.exports = {
  frontendConfig,
  backendConfig,
}
