import BigNumber from 'bignumber.js'

const addThousandsCommas = (amount, fractionDigits) =>
  parseFloat(amount).toLocaleString('en-US', {
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  })

const formatFiat = (amount: BigNumber, maxDigits = 10 as number): string => {
  if (!maxDigits || amount.toFixed(2).length <= maxDigits) {
    return addThousandsCommas(amount, 2)
  }
  return `${addThousandsCommas(amount.idiv(1000), 0)}k`
}

const printConversionRate = (amount: BigNumber, conversionRates: any, currency: string): string =>
  isNaN(Number(amount)) ? '' : formatFiat(amount.times(0.000001).times(conversionRates[currency]))

const printConversionRates = (amount: BigNumber, conversionRates: any, maxDigits: number): string =>
  isNaN(Number(amount))
    ? ''
    : `$\u00A0${formatFiat(amount.times(0.000001).times(conversionRates.USD), maxDigits)},
       €\u00A0${formatFiat(amount.times(0.000001).times(conversionRates.EUR), maxDigits)}`

export {printConversionRates, printConversionRate}
