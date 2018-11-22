const {HARDENED_THRESHOLD} = require('../constants')

const indexIsHardened = (index) => index >= HARDENED_THRESHOLD

module.exports = indexIsHardened
