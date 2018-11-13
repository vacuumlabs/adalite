const addThousandsCommas = (amount, fractionDigits) =>
  parseFloat(amount).toLocaleString('en-US', {
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  })

const formatFiat = (amount, maxDigits) => {
  if (!maxDigits || amount.toFixed(2).length <= maxDigits) {
    return addThousandsCommas(amount, 2)
  }
  return `${addThousandsCommas(Math.trunc(amount / 1000), 0)}k`
}

const printConversionRates = (amount, conversionRates, maxDigits) =>
  isNaN(Number(amount))
    ? ''
    : `$\u00A0${formatFiat(conversionRates.USD * amount * 0.000001, maxDigits)},
       €\u00A0${formatFiat(conversionRates.EUR * amount * 0.000001, maxDigits)}`

module.exports = printConversionRates
