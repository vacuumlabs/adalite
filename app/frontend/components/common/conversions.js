import {h} from 'preact'
import {printConversionRate} from '../../helpers/printConversionRates'

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

export default Conversions
