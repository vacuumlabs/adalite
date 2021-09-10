import {State} from '../state'
import {ConversionRates} from '../types'
import request from '../wallet/helpers/request'

async function getConversionRates(state: State): Promise<ConversionRates> {
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

async function fetchConversionRates(): Promise<ConversionRates['data']> {
  return await request('https://min-api.cryptocompare.com/data/price?fsym=ADA&tsyms=USD,EUR').catch(
    (e) => null
  )
}

export default getConversionRates
