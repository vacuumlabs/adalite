const {h} = require('preact')
const connect = require('unistore/preact').connect
const actions = require('../../../actions')
const Balance = require('../../common/balance')
const TransactionHistory = require('./transactionHistory')
const ExportCard = require('../exportWallet/exportCard')

const DashboardTabs = ({balance, transactionHistory, reloadWalletInfo, conversionRates}) =>
  h('div', {class: 'dashboard-tabs'})

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
    {class: 'page-wrapper'},
    h(
      'div',
      {class: 'dashboard desktop'},
      h(
        'div',
        {class: 'dashboard-column'},
        h(Balance, {balance, reloadWalletInfo, conversionRates}),
        h(TransactionHistory, {transactionHistory, conversionRates})
      ),
      h('div', {class: 'dashboard-column'}, h(ExportCard))
    ),
    h(
      'div',
      {class: 'dashboard mobile'},
      h(Balance, {balance, reloadWalletInfo, conversionRates}),
      h('div', {class: 'dashboard-tabs'}, h(DashboardTabs)),
      h(ExportCard)
    )
  )
)

module.exports = TxHistoryPage
