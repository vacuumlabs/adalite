let config = require('dotenv').config()
// hotfix, since dotenv on local keeps "hiding" the env variables behind "parsed" field
if (config.parsed !== undefined) {
  config = config.parsed
} else {
  config = {
    CARDANOLITE_BLOCKCHAIN_EXPLORER_URL: process.env.CARDANOLITE_BLOCKCHAIN_EXPLORER_URL,
    CARDANOLITE_TRANSACTION_SUBMITTER_URL: process.env.CARDANOLITE_TRANSACTION_SUBMITTER_URL,
    CARDANOLITE_ADDRESS_RECOVERY_GAP_LENGTH: process.env.CARDANOLITE_ADDRESS_RECOVERY_GAP_LENGTH,
    CARDANOLITE_FORCE_HTTPS: process.env.CARDANOLITE_FORCE_HTTPS,
    REDIS_URL: process.env.REDIS_URL,
  }
}

module.exports = config
