import {State} from '../state'
import {ConversionRates} from '../types'
import * as assert from 'assert'

const COINGECKO_PRICE_URL =
  'https://api.coingecko.com/api/v3/simple/price?ids=cardano&vs_currencies=usd,eur'

async function getConversionRates(state: State): Promise<ConversionRates> {
  let conversionRates = state.conversionRates
  const maxConversionRatesAge = 1000 * 60 * 5

  if (!conversionRates || Date.now() - conversionRates.timestamp > maxConversionRatesAge) {
    conversionRates = {
      timestamp: Date.now(),
      data: await fetchConversionRates(),
    }
  }
  assert(conversionRates != null)

  return conversionRates
}

async function fetchConversionRates(): Promise<ConversionRates['data']> {
  try {
    const response = await fetch(COINGECKO_PRICE_URL, {credentials: 'omit'})
    if (!response.ok) {
      return null
    }

    const data = await response.json()
    if (!data?.cardano) {
      return null
    }

    return {
      USD: data.cardano.usd,
      EUR: data.cardano.eur,
    }
  } catch (e) {
    return null
  }
}

export default getConversionRates
