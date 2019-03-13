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
      href: `https://adascan.net/transaction/${address}`,
      target: '_blank',
      rel: 'noopener',
    },
    'View on AdaScan'
  )

const TransactionHistory = ({transactionHistory}) =>
  h(
    'div',
    {class: 'transactions card'},
    h('h2', {class: 'card-title'}, 'Transaction History'),
    transactionHistory.length === 0
      ? h('div', {class: 'transactions-empty'}, 'No transactions found')
      : h(
        'ul',
        {class: 'transactions-content'},
        ...transactionHistory.map((transaction) =>
          h(
            'li',
            {class: 'transaction-item'},
            h('div', {class: 'transaction-date'}, formatDate(transaction.ctbTimeIssued)),
            h(FormattedAmount, {amount: transaction.effect}),
            h(TransactionAddress, {address: transaction.ctbId}),
            h(FormattedFee, {fee: transaction.fee})
          )
        )
      )
  )

module.exports = TransactionHistory
