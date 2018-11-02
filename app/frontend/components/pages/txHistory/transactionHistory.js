const {h} = require('preact')
const printAda = require('../../../helpers/printAda')
const printConversionRates = require('../../../helpers/printConversionRates')
const AdaIcon = require('../../common/svg').AdaIcon
const Tooltip = require('../../common/tooltip')

const PrettyValue = ({effect}) => {
  const value = printAda(Math.abs(effect))
  const prefix = effect > 0 ? '+ ' : '- '
  const number = `${value}`.indexOf('.') === -1 ? `${value}.0` : `${value}`
  return h(
    'pre',
    {style: `color: ${effect > 0 ? 'green' : 'red'}`},
    `${prefix}${number}`.padEnd(10)
  )
}

const TransactionAddress = ({address}) =>
  h(
    'a',
    {
      class: 'transaction-id with-tooltip',
      tooltip: 'Examine via CardanoExplorer.com',
      href: `https://cardanoexplorer.com/tx/${address}`,
      target: '_blank',
    },
    address
  )

const TransactionHistory = ({transactionHistory, conversionRates}) =>
  h(
    'div',
    {class: ''},
    h('h2', undefined, 'Transaction History'),
    h(
      'div',
      {class: 'transaction-history-wrapper'},
      h(
        'table',
        {undefined},
        h(
          'thead',
          undefined,
          h(
            'tr',
            undefined,
            h('th', undefined, 'Time'),
            h('th', undefined, 'Movement (', h(AdaIcon, {className: 'ada-sign-inline'}), ')'),
            h('th', undefined, 'Fee (', h(AdaIcon, {className: 'ada-sign-inline'}), ')'),
            h('th', undefined, 'Transaction')
          )
        ),
        h(
          'tbody',
          undefined,
          ...transactionHistory.map((transaction) =>
            h(
              'tr',
              undefined,
              h('td', undefined, new Date(transaction.ctbTimeIssued * 1000).toLocaleString()),
              h(
                'td',
                {class: 'align-right'},
                conversionRates
                  ? h(
                    Tooltip,
                    {tooltip: `${printConversionRates(transaction.effect, conversionRates)}`},
                    h(PrettyValue, {effect: transaction.effect})
                  )
                  : h(PrettyValue, {effect: transaction.effect})
              ),
              h(
                'td',
                {class: 'align-right'},
                transaction.effect < 0
                  ? conversionRates
                    ? h(
                      Tooltip,
                      {tooltip: `${printConversionRates(transaction.fee, conversionRates)}`},
                      h('pre', undefined, printAda(transaction.fee))
                    )
                    : h('pre', undefined, printAda(transaction.fee))
                  : ''
              ),
              h('td', undefined, h(TransactionAddress, {address: transaction.ctbId}))
            )
          )
        )
      ),
      transactionHistory.length === 0 && h('div', undefined, 'No records')
    )
  )

module.exports = TransactionHistory
