// config intended to be passed on to frontend
// keys in process .env must be referenced explicitly
// so dotenv-webpack is able to include them in the test bundle for Mocha tests
const check = require('check-types')

// process.env.npm_package_version is undefined on Heroku
const appVersion = require('../../package.json').version

const boolStrings = ['true', 'false']
const isBoolString = (str) => boolStrings.includes(str)
const isPositiveIntString = (str) => check.positive(parseInt(str, 10))
const isIntString = (str) => check.integer(parseInt(str, 10))

const checkMap = check.map(process.env, {
  PORT: isPositiveIntString,
  ADALITE_ENABLE_DEBUGGING: isBoolString,
  ADALITE_SERVER_URL: check.nonEmptyString,
  ADALITE_BLOCKCHAIN_EXPLORER_URL: check.nonEmptyString,
  ADALITE_DEFAULT_ADDRESS_COUNT: isPositiveIntString,
  ADALITE_GAP_LIMIT: isPositiveIntString,
  ADALITE_DEMO_WALLET_MNEMONIC: check.nonEmptyString,
  ADALITE_LOGOUT_AFTER: isIntString,
  ADALITE_DISABLE_LEDGER: isBoolString,
  ADALITE_ENABLE_SERVER_MOCKING_MODE: isBoolString,
  ADALITE_MOCK_TX_SUBMISSION_SUCCESS: isBoolString,
  ADALITE_MOCK_TX_SUMMARY_SUCCESS: isBoolString,
})

const {
  PORT,
  ADALITE_ENABLE_DEBUGGING,
  ADALITE_SERVER_URL,
  ADALITE_BLOCKCHAIN_EXPLORER_URL,
  ADALITE_DEFAULT_ADDRESS_COUNT,
  ADALITE_GAP_LIMIT,
  REDIS_URL,
  STATS_PWD,
  ADALITE_DEMO_WALLET_MNEMONIC,
  ADALITE_LOGOUT_AFTER,
  ADALITE_DISABLE_LEDGER,
  ADALITE_ENABLE_SERVER_MOCKING_MODE,
  ADALITE_MOCK_TX_SUBMISSION_SUCCESS,
  ADALITE_MOCK_TX_SUMMARY_SUCCESS,
  TREZOR_CONNECT_URL,
} = process.env

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
  ADALITE_APP_VERSION: appVersion,
  ADALITE_LOGOUT_AFTER,
  TREZOR_CONNECT_URL,
  ADALITE_DISABLE_LEDGER,
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
