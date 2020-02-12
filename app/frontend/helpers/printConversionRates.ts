const addThousandsCommas = (amount, fractionDigits) =>
  parseFloat(amount).toLocaleString('en-US', {
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  })

const formatFiat = (amount: number, maxDigits = 10 as number): string => {
  if (!maxDigits || amount.toFixed(2).length <= maxDigits) {
    return addThousandsCommas(amount, 2)
  }
  return `${addThousandsCommas(Math.trunc(amount / 1000), 0)}k`
}

const printConversionRate = (amount: number, conversionRates: any, currency: string): string =>
  isNaN(Number(amount)) ? '' : formatFiat(conversionRates[currency] * amount * 0.000001)

const printConversionRates = (amount: number, conversionRates: any, maxDigits: number): string =>
  isNaN(Number(amount))
    ? ''
    : `$\u00A0${formatFiat(conversionRates.USD * amount * 0.000001, maxDigits)},
       €\u00A0${formatFiat(conversionRates.EUR * amount * 0.000001, maxDigits)}`

export {printConversionRates, printConversionRate}
