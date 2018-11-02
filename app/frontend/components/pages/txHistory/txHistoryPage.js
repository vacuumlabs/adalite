const {h} = require('preact')
const connect = require('unistore/preact').connect
const actions = require('../../../actions')
const Balance = require('../../common/balance')
const TransactionHistory = require('./transactionHistory')

const TxHistoryPage = connect(
  (state) => ({
    balance: state.balance,
    transactionHistory: state.transactionHistory,
    conversionRates: state.conversionRates && state.conversionRates.data,
  }),
  actions
)(({balance, transactionHistory, reloadWalletInfo, conversionRates}) =>
  h(
    'div',
    {class: 'content-wrapper'},
    h(Balance, {balance, reloadWalletInfo, conversionRates}),
    h(TransactionHistory, {transactionHistory, conversionRates})
  )
)

module.exports = TxHistoryPage
