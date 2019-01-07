const {h} = require('preact')
const printAda = require('../../../helpers/printAda')
const formatDate = require('../../../helpers/formatDate')

const FormattedAmount = ({amount}) => {
  const value = printAda(Math.abs(amount))
  const number = `${value}`.indexOf('.') === -1 ? `${value}.0` : `${value}`
  return h(
    'div',
    {
      class: `transaction-amount ${amount > 0 ? 'credit' : 'debit'}`,
    },
    `${number}`.padEnd(10)
  )
}

const FormattedFee = ({fee}) => {
  const value = printAda(fee)
  return h(
    'div',
    {
      class: 'transaction-fee',
    },
    `Fee: ${value}`
  )
}

const TransactionAddress = ({address}) =>
  h(
    'a',
    {
      class: 'transaction-address',
      tooltip: 'Examine via AdaScan.net',
      href: `https://adascan.net/transaction/${address}`,
      target: '_blank',
      rel: 'noopener',
    },
    'View details'
  )

const TransactionHistory = ({transactionHistory}) =>
  h(
    'div',
    {class: 'transactions card'},
    h('h2', {class: 'transactions-title'}, 'Transaction History'),
    ...transactionHistory.map((transaction) =>
      h(
        'div',
        {class: 'transaction-item'},
        h('div', {class: 'transaction-date'}, formatDate(transaction.ctbTimeIssued)),
        h(FormattedAmount, {amount: transaction.effect}),
        h(TransactionAddress, {address: transaction.ctbId}),
        h(FormattedFee, {fee: transaction.fee})
      )
    ),
    /* TODO: implement button functionality */
    h(
      'button',
      {
        class: 'button primary fullwidth',
      },
      'Show another 8 transactions'
    )
  )

module.exports = TransactionHistory
