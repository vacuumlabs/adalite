const {h} = require('preact')
const connect = require('unistore/preact').connect

const Balance = require('./balance')
const TransactionHistory = require('./transactionHistory')

const Dashboard = connect((state) => ({
  balance: state.balance,
  transactionHistory: state.transactionHistory,
}))(({balance, transactionHistory}) =>
  h(
    'div',
    {class: 'content-wrapper'},
    h(Balance, {balance}),
    h(TransactionHistory, {transactionHistory})
  )
)

module.exports = Dashboard
