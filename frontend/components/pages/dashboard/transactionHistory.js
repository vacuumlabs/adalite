const {h} = require('preact')
const printAda = require('../../../printAda')

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

const TransactionHistory = ({transactionHistory}) =>
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
            h('th', undefined, 'Transaction'),
            h('th', undefined, 'Movement (ADA)')
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
              h('td', undefined, h(TransactionAddress, {address: transaction.ctbId})),
              h('td', undefined, h(PrettyValue, {effect: transaction.effect}))
            )
          )
        )
      )
    )
  )

module.exports = TransactionHistory
