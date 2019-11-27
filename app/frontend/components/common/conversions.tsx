import {h} from 'preact'
import {printConversionRate} from '../../helpers/printConversionRates'

interface Props {
  balance: number
  conversionRates: any
}

const Conversions = ({balance, conversionRates}: Props) =>
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
