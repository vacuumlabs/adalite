const {h} = require('preact')
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

module.exports = Conversions
