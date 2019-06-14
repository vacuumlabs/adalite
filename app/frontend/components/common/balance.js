const {h} = require('preact')
const printAda = require('../../helpers/printAda')
const {printConversionRate} = require('../../helpers/printConversionRates')

const Conversions = ({balance, conversionRates}) =>
  h(
    'div',
    {class: 'conversions'},
    h(
      'div',
      {class: 'conversions-item'},
      `$ ${printConversionRate(balance, conversionRates, 'USD')}`
    ),
    h(
      'div',
      {class: 'conversions-item'},
      `€ ${printConversionRate(balance, conversionRates, 'EUR')}`
    )
  )

const Balance = ({balance, reloadWalletInfo, conversionRates}) =>
  h(
    'div',
    {class: 'balance card'},
    h('h2', {class: 'card-title balance-title'}, 'Balance'),
    h(
      'div',
      {class: 'balance-row'},
      h(
        'div',
        {class: 'balance-amount'},
        isNaN(Number(balance)) ? balance : `${printAda(balance)}`
      ),
      h(
        'button',
        {
          class: 'button refresh',
          onClick: reloadWalletInfo,
        },
        'Refresh Balance'
      )
    ),
    conversionRates && h(Conversions, {balance, conversionRates}),
    h(
      'div',
      {class: 'buy-ada-partner-wrapper'},
      h(
        'a',
        {
          class: 'button primary outline link buy-ada-partner-link',
          href: 'https://exchange.adalite.io/',
          target: '_blank',
        },
        'Buy ADA'
      ),
      h(
        'span',
        {
          class: 'buy-ada-partner-logo',
        },
        'Powered by',
        h('img', {
          class: 'buy-ada-partner-logo-img',
          src: 'assets/coinswitch-logo.svg',
          alt: 'CoinSwitch logo',
        })
      )
    )
  )

module.exports = Balance
