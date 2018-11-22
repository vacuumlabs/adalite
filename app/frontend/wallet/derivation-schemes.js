const {HARDENED_THRESHOLD} = require('./constants')

const derivationSchemes = {
  v1: {
    type: 'v1',
    number: 1,
    startAddressIndex: HARDENED_THRESHOLD,
    toAbsoluteDerivationPath: (derivationPath) => [derivationPath[0], derivationPath[2]],
  },
  v2: {
    type: 'v2',
    number: 2,
    startAddressIndex: 0,
    toAbsoluteDerivationPath: (derivationPath) =>
      [
        HARDENED_THRESHOLD + 44, // 44'
        HARDENED_THRESHOLD + 1815, // 1815'
      ].concat(derivationPath),
  },
}

module.exports = derivationSchemes
