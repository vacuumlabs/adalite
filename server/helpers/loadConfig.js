// config intended to be passed on to frontend
// keys in process .env must be referencesd explicitly
// so dotenv-webpack is able to include them in the test bundle for Mocha tests
const check = require('check-types')

// process.env.npm_package_version is undefined on Heroku
const appVersion = require('../../package.json').version

const {env} = process
const booleans = ['true', 'false']

check.assert(
  booleans.includes(env.ADALITE_ENABLE_DEBUGGING),
  'ADALITE_ENABLE_DEBUGGING must be boolean'
)
check.assert.nonEmptyString(env.ADALITE_SERVER_URL, 'ADALITE_SERVER_URL must be a non empty string')
check.assert.nonEmptyString(
  env.ADALITE_BLOCKCHAIN_EXPLORER_URL,
  'ADALITE_SERVER_URL must be a non empty string'
)
check.assert.positive(
  parseInt(env.ADALITE_DEFAULT_ADDRESS_COUNT, 10),
  'ADALITE_DEFAULT_ADDRESS_COUNT must be a positive number'
)
check.assert.positive(
  parseInt(env.ADALITE_GAP_LIMIT, 10),
  'ADALITE_GAP_LIMIT must be a positive number'
)
check.assert.nonEmptyString(
  env.ADALITE_DEMO_WALLET_MNEMONIC,
  'ADALITE_DEMO_WALLET_MNEMONIC must be a non empty string'
)
check.assert(booleans.includes(env.ADALITE_ENABLE_TREZOR), 'ADALITE_ENABLE_TREZOR must be boolean')
check.assert.positive(
  parseInt(env.ADALITE_LOGOUT_AFTER, 10),
  'ADALITE_LOGOUT_AFTER must be a positive number'
)
check.assert(
  booleans.includes(env.ADALITE_ENABLE_SERVER_MOCKING_MODE),
  'ADALITE_ENABLE_SERVER_MOCKING_MODE must be boolean'
)
check.assert(
  booleans.includes(env.ADALITE_MOCK_TX_SUBMISSION_SUCCESS),
  'ADALITE_MOCK_TX_SUBMISSION_SUCCESS must be boolean'
)
check.assert(
  booleans.includes(env.ADALITE_MOCK_TX_SUMMARY_SUCCESS),
  'ADALITE_MOCK_TX_SUMMARY_SUCCESS must be boolean'
)

const frontendConfig = {
  ADALITE_SERVER_URL: env.ADALITE_SERVER_URL,
  /*
  * if mocking is enabled, blockchain url is replaced with server url so the server is
  * able to intercept the requests from the frontend and mock the responses
  */
  ADALITE_BLOCKCHAIN_EXPLORER_URL:
    env.ADALITE_ENABLE_SERVER_MOCKING_MODE === 'true'
      ? env.ADALITE_SERVER_URL
      : env.ADALITE_BLOCKCHAIN_EXPLORER_URL,
  ADALITE_DEFAULT_ADDRESS_COUNT: parseInt(env.ADALITE_DEFAULT_ADDRESS_COUNT, 10),
  ADALITE_GAP_LIMIT: parseInt(env.ADALITE_GAP_LIMIT, 10),
  ADALITE_DEMO_WALLET_MNEMONIC: env.ADALITE_DEMO_WALLET_MNEMONIC,
  ADALITE_ENABLE_DEBUGGING: env.ADALITE_ENABLE_DEBUGGING === 'true',
  ADALITE_ENABLE_TREZOR: !!env.ADALITE_ENABLE_TREZOR,
  ADALITE_APP_VERSION: appVersion,
  ADALITE_LOGOUT_AFTER: env.ADALITE_LOGOUT_AFTER,
  TREZOR_CONNECT_URL: env.TREZOR_CONNECT_URL,
}

const backendConfig = {
  STATS_PWD: env.STATS_PWD,
  REDIS_URL: env.REDIS_URL,
  TREZOR_CONNECT_URL: env.TREZOR_CONNECT_URL,
  ADALITE_ENABLE_SERVER_MOCKING_MODE: env.ADALITE_ENABLE_SERVER_MOCKING_MODE,
  ADALITE_MOCK_TX_SUBMISSION_SUCCESS: env.ADALITE_MOCK_TX_SUBMISSION_SUCCESS,
  ADALITE_MOCK_TX_SUMMARY_SUCCESS: env.ADALITE_MOCK_TX_SUMMARY_SUCCESS,
  ADALITE_BLOCKCHAIN_EXPLORER_URL: env.ADALITE_BLOCKCHAIN_EXPLORER_URL,
  ADALITE_SERVER_URL: env.ADALITE_SERVER_URL,
  PORT: env.PORT,
}

module.exports = {
  frontendConfig,
  backendConfig,
}
