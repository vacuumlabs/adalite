const request = require('../wallet/helpers/request')

async function getConversionRates(state) {
  let conversionRates = state.conversionRates
  const maxConversionRatesAge = 1000 * 60 * 5

  if (!conversionRates || Date.now() - conversionRates.timestamp > maxConversionRatesAge) {
    conversionRates = {
      timestamp: Date.now(),
      data: await fetchConversionRates(),
    }
  }

  return conversionRates
}
async function fetchConversionRates() {
  return await request('https://min-api.cryptocompare.com/data/price?fsym=ADA&tsyms=USD,EUR')
}

module.exports = getConversionRates
