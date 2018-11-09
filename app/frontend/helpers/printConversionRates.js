const addCommas = (amount) => parseFloat(amount).toLocaleString('en-US')

const formatFiat = (amount, maxDigits) => {
  const newAmount = (amount * 0.000001).toFixed(2)
  const amountString = newAmount.toString()
  if (amountString.length <= maxDigits) {
    return addCommas(newAmount)
  }
  if (amountString.indexOf('.') <= maxDigits + 1) {
    return addCommas(amountString.substr(0, maxDigits + 1))
  }
  return `${addCommas(Math.trunc(amountString / 1000))}K`
}

const printConversionRates = (amount, conversionRates, maxDigits) =>
  isNaN(Number(amount))
    ? ''
    : maxDigits
      ? `$\u00A0${formatFiat(conversionRates.USD * amount, maxDigits)},
        €\u00A0${formatFiat(conversionRates.EUR * amount, maxDigits)}`
      : `$\u00A0${addCommas(
        (conversionRates.USD * amount * 0.000001).toFixed(2)
      )}, €\u00A0${addCommas((conversionRates.EUR * amount * 0.000001).toFixed(2))}`

module.exports = printConversionRates
