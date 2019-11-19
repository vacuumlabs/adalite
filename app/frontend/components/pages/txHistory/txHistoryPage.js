const {h, Component} = require('preact')
const connect = require('unistore/preact').connect
const actions = require('../../../actions')
const Balance = require('../../common/balance')
const TransactionHistory = require('./transactionHistory')
const ExportCard = require('../exportWallet/exportCard')
const SendAdaPage = require('../sendAda/sendAdaPage')
const MyAddresses = require('../receiveAda/myAddresses')

class DashboardMobileContent extends Component {
  constructor(props) {
    super(props)
    this.state = {selectedTab: 'transactions'}
    this.changeTab = this.changeTab.bind(this)
  }
  changeTab(tabName) {
    this.setState({selectedTab: tabName})
  }
  render({transactionHistory, conversionRates}, {selectedTab}) {
    const dashboardTab = (tabName, tabText) =>
      h(
        'li',
        {
          class: `dashboard-tab ${tabName === selectedTab ? 'selected' : ''}`,
          onClick: () => this.changeTab(tabName),
        },
        tabText
      )

    return h(
      'div',
      {class: 'dashboard-content'},
      h(
        'ul',
        {class: 'dashboard-tabs'},
        dashboardTab('transactions', 'Transactions'),
        dashboardTab('send', 'Send ADA'),
        dashboardTab('receive', 'Receive ADA')
      ),
      selectedTab === 'send' && h(SendAdaPage),
      selectedTab === 'transactions' &&
        h(TransactionHistory, {transactionHistory, conversionRates}),
      selectedTab === 'receive' && h(MyAddresses)
    )
  }
}

const TxHistoryPage = connect(
  (state) => ({
    balance: state.balance,
    transactionHistory: state.transactionHistory,
    conversionRates: state.conversionRates && state.conversionRates.data,
    showExportOption: state.showExportOption,
  }),
  actions
)(({balance, transactionHistory, reloadWalletInfo, conversionRates, showExportOption}) =>
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
      )
      /*
      h(
        'div',
        {class: 'dashboard-column'},
        h(SendAdaPage),
        h(MyAddresses),
        showExportOption && h(ExportCard)
      )
      */
    ),
    h(
      'div',
      {class: 'dashboard mobile'},
      h(Balance, {balance, reloadWalletInfo, conversionRates}),
      h(TransactionHistory, {transactionHistory, conversionRates})
      //h(DashboardMobileContent, {balance, transactionHistory, reloadWalletInfo, conversionRates}),
      //showExportOption && h(ExportCard)
    )
  )
)

module.exports = TxHistoryPage
