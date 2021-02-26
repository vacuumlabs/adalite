// config intended to be passed on to frontend
// keys in process .env must be referenced explicitly
// so dotenv-webpack is able to include them in the test bundle for Mocha tests
require('dotenv').config()
const check = require('check-types')

// process.env.npm_package_version is undefined on Heroku
const appVersion = require('../../package.json').version

const encodeToHtml = (str) =>
  str.replace(/[\u00A0-\u9999<>&']/gim, (i) => {
    return `&#${i.charCodeAt(0)};`
  })

const shelleyNetworks = ['MAINNET', 'MARY_TESTNET']
const isValidShelleyNetwork = (str) => shelleyNetworks.includes(str)
const boolStrings = ['true', 'false']
const isBoolString = (str) => boolStrings.includes(str)
const isPositiveIntString = (str) => check.positive(parseInt(str, 10))
const isIntString = (str) => check.integer(parseInt(str, 10))
const isCommaDelimitedListOfIpsOrEmpty = (str) => {
  if (!str) {
    return true
  }

  const ipItems = str.replace(/ /g, '').split(',')

  return ipItems.every((ipItem) => {
    const ipParts = ipItem.split('.')

    if (ipParts.length !== 4) {
      return false
    }

    return ipParts.every((ipPart) => {
      const ipPartInt = parseInt(ipPart, 10)
      return !isNaN(ipPartInt) && ipPartInt >= 0 && ipPartInt <= 255
    })
  })
}

const checkMap = check.map(process.env, {
  PORT: isPositiveIntString,
  ADALITE_ENABLE_DEBUGGING: isBoolString,
  ADALITE_SERVER_URL: check.nonEmptyString,
  ADALITE_BLOCKCHAIN_EXPLORER_URL: check.nonEmptyString,
  ADALITE_DEFAULT_ADDRESS_COUNT: isPositiveIntString,
  ADALITE_GAP_LIMIT: isPositiveIntString,
  ADALITE_DEMO_WALLET_MNEMONIC: check.nonEmptyString,
  ADALITE_LOGOUT_AFTER: isIntString,
  ADALITE_ENABLE_SERVER_MOCKING_MODE: isBoolString,
  ADALITE_MOCK_TX_SUBMISSION_SUCCESS: isBoolString,
  ADALITE_MOCK_TX_SUMMARY_SUCCESS: isBoolString,
  ADALITE_DEVEL_AUTO_LOGIN: isBoolString,
  ADALITE_SUPPORT_EMAIL: check.nonEmptyString,
  ADALITE_FIXED_DONATION_VALUE: isPositiveIntString,
  ADALITE_MIN_DONATION_VALUE: isPositiveIntString,
  ADALITE_ENV: check.nonEmptyString,
  ADALITE_IP_BLACKLIST: isCommaDelimitedListOfIpsOrEmpty,
  SENTRY_DSN: check.nonEmptyString,
  ADALITE_ERROR_BANNER_CONTENT: check.string,
  ADALITE_NETWORK: isValidShelleyNetwork,
  ADALITE_ENABLE_TREZOR: isBoolString,
  ADALITE_ENABLE_LEDGER: isBoolString,
  ADALITE_ENFORCE_STAKEPOOL: isBoolString,
  ADALITE_ENABLE_SEARCH_BY_TICKER: isBoolString,
})

const {
  PORT,
  REDIS_URL,
  ADALITE_ENABLE_DEBUGGING,
  ADALITE_SERVER_URL,
  ADALITE_BLOCKCHAIN_EXPLORER_URL,
  ADALITE_DEFAULT_ADDRESS_COUNT,
  ADALITE_GAP_LIMIT,
  ADALITE_STATS_PWD,
  ADALITE_DEMO_WALLET_MNEMONIC,
  ADALITE_LOGOUT_AFTER,
  ADALITE_ENABLE_SERVER_MOCKING_MODE,
  ADALITE_MOCK_TX_SUBMISSION_SUCCESS,
  ADALITE_MOCK_TX_SUMMARY_SUCCESS,
  ADALITE_DEVEL_AUTO_LOGIN,
  ADALITE_TREZOR_CONNECT_URL,
  ADALITE_SUPPORT_EMAIL,
  ADALITE_GA_TRACKING_ID,
  ADALITE_FIXED_DONATION_VALUE,
  ADALITE_MIN_DONATION_VALUE,
  ADALITE_MAILCHIMP_API_KEY,
  ADALITE_MAILCHIMP_LIST_ID,
  ADALITE_STAKE_POOL_ID,
  ADALITE_ENFORCE_STAKEPOOL,
  ADALITE_ENABLE_SEARCH_BY_TICKER,
  ADALITE_ENV,
  ADALITE_IP_BLACKLIST,
  SENTRY_DSN,
  ADALITE_CARDANO_VERSION,
  ADALITE_NETWORK,
  ADALITE_ENABLE_TREZOR,
  ADALITE_ENABLE_LEDGER,
} = process.env

const ADALITE_BACKEND_TOKEN = process.env.ADALITE_BACKEND_TOKEN || undefined

if (!check.all(checkMap)) {
  let problemFound = false
  for (const k of Object.keys(checkMap)) {
    if (!checkMap[k]) {
      problemFound = true
      // eslint-disable-next-line no-console
      console.log('Invalid environment variable', k)
    }
  }
  if (problemFound) {
    throw new Error('Invalid environment variables')
  }
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
  ADALITE_TREZOR_CONNECT_URL,
  ADALITE_SUPPORT_EMAIL,
  ADALITE_BACKEND_TOKEN,
  ADALITE_FIXED_DONATION_VALUE,
  ADALITE_MIN_DONATION_VALUE,
  ADALITE_STAKE_POOL_ID,
  ADALITE_ENV,
  SENTRY_DSN,
  ADALITE_DEVEL_AUTO_LOGIN,
  ADALITE_CARDANO_VERSION,
  ADALITE_ERROR_BANNER_CONTENT: encodeToHtml(process.env.ADALITE_ERROR_BANNER_CONTENT),
  ADALITE_NETWORK,
  ADALITE_ENABLE_TREZOR: ADALITE_ENABLE_TREZOR === 'true',
  ADALITE_ENABLE_LEDGER: ADALITE_ENABLE_LEDGER === 'true',
  ADALITE_ENFORCE_STAKEPOOL: ADALITE_ENFORCE_STAKEPOOL === 'true',
  ADALITE_ENABLE_SEARCH_BY_TICKER: ADALITE_ENABLE_SEARCH_BY_TICKER === 'true',
}

const backendConfig = {
  PORT,
  REDIS_URL,
  ADALITE_STATS_PWD,
  ADALITE_TREZOR_CONNECT_URL,
  ADALITE_ENABLE_SERVER_MOCKING_MODE,
  ADALITE_MOCK_TX_SUBMISSION_SUCCESS,
  ADALITE_MOCK_TX_SUMMARY_SUCCESS,
  ADALITE_BLOCKCHAIN_EXPLORER_URL,
  ADALITE_SERVER_URL,
  ADALITE_BACKEND_TOKEN,
  ADALITE_GA_TRACKING_ID,
  ADALITE_MAILCHIMP_API_KEY,
  ADALITE_MAILCHIMP_LIST_ID,
  ADALITE_IP_BLACKLIST: ADALITE_IP_BLACKLIST
    ? ADALITE_IP_BLACKLIST.replace(/ /g, '').split(',')
    : [],
  ADALITE_CARDANO_VERSION,
}

module.exports = {
  frontendConfig,
  backendConfig,
}
