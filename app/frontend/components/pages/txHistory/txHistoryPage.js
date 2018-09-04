const {h} = require('preact')
const connect = require('unistore/preact').connect
const actions = require('../../../actions')
const Balance = require('../../common/balance')
const TransactionHistory = require('./transactionHistory')

const TxHistoryPage = connect(
  (state) => ({
    balance: state.balance,
    transactionHistory: state.transactionHistory,
  }),
  actions
)(({balance, transactionHistory, reloadWalletInfo}) =>
  h(
    'div',
    {class: 'content-wrapper'},
    h(Balance, {balance, reloadWalletInfo}),
    h(TransactionHistory, {transactionHistory})
  )
)

module.exports = TxHistoryPage
