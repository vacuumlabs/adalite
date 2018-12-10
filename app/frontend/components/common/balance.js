const {h} = require('preact')
const printAda = require('../../helpers/printAda')
const printConversionRates = require('../../helpers/printConversionRates')

const truncatePrintAda = (amount, maxDigits) => {
  const amountString = amount.toString()
  if (amountString.length <= maxDigits) {
    return amount
  }
  if (amountString.indexOf('.') <= maxDigits + 1) {
    return amountString.substr(0, maxDigits + 1)
  }
  return `${Math.trunc(amountString / 1000)}K`
}

const Balance = ({balance, reloadWalletInfo, conversionRates}) =>
  h(
    'div',
    {class: 'balance-block'},
    h('h2', undefined, 'Balance'),
    h(
      'span',
      {class: 'balance-value'},
      h(
        'span',
        {class: 'on-desktop-only'},
        isNaN(Number(balance)) ? balance : `${printAda(balance)}`
      ),
      h(
        'span',
        {class: 'on-mobile-only not-narrow-screen'},
        isNaN(Number(balance)) ? balance : `${truncatePrintAda(printAda(balance), 12)}`
      ),
      h(
        'span',
        {class: 'narrow-screen-only'},
        isNaN(Number(balance)) ? balance : `${truncatePrintAda(printAda(balance), 10)}`
      ),
      h('img', {src: 'assets/ada-icon.svg', className: 'ada-sign-big'}),
      h(
        'button',
        {class: 'button button--refresh', onClick: reloadWalletInfo},
        h('img', {src: 'assets/refresh-icon.svg'})
      )
    ),
    conversionRates &&
      h(
        'div',
        {className: 'other-currencies-balance on-desktop-only'},
        `(${printConversionRates(balance, conversionRates)})`
      ),
    conversionRates &&
      h(
        'div',
        {className: 'other-currencies-balance on-mobile-only not-narrow-screen'},
        `(${printConversionRates(balance, conversionRates, 12)})`
      ),
    conversionRates &&
      h(
        'div',
        {className: 'other-currencies-balance narrow-screen-only'},
        `(${printConversionRates(balance, conversionRates, 10)})`
      )
  )

module.exports = Balance
