import {h, Component} from 'preact'
import {connect} from '../../../helpers/connect'
import actions from '../../../actions'
import Balance from '../../common/balance'
import TransactionHistory from './transactionHistory'
import ExportCard from '../exportWallet/exportCard'
import SendAdaPage from '../sendAda/sendAdaPage'
import MyAddresses from '../receiveAda/myAddresses'

interface Props {
  transactionHistory: any
  conversionRates: any
}

class DashboardMobileContent extends Component<Props> {
  constructor(props) {
    super(props)
    this.state = {selectedTab: 'transactions'}
    this.changeTab = this.changeTab.bind(this)
  }
  changeTab(tabName) {
    this.setState({selectedTab: tabName})
  }
  render({transactionHistory, conversionRates}, {selectedTab}) {
    const dashboardTab = (tabName, tabText) => (
      <li
        className={`dashboard-tab ${tabName === selectedTab ? 'selected' : ''}`}
        onClick={() => this.changeTab(tabName)}
      >
        {tabText}
      </li>
    )

    return (
      <div className="dashboard-content">
        <ul className="dashboard-tabs">
          {dashboardTab('transactions', 'Transactions')}
          {dashboardTab('send', 'Send ADA')}
          {dashboardTab('receive', 'Receive ADA')}
        </ul>
        {selectedTab === 'send' && <SendAdaPage />}
        {selectedTab === 'transactions' && (
          <TransactionHistory
            transactionHistory={transactionHistory}
          />
        )}
        {selectedTab === 'receive' && <MyAddresses />}
      </div>
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
)(({balance, transactionHistory, reloadWalletInfo, conversionRates, showExportOption}) => (
  <div className="page-wrapper">
    <div className="dashboard desktop">
      <div className="dashboard-column">
        <Balance
          balance={balance}
          reloadWalletInfo={reloadWalletInfo}
          conversionRates={conversionRates}
        />
        <TransactionHistory
          transactionHistory={transactionHistory}
        />
      </div>
      <div className="dashboard-column">
        <SendAdaPage />
        <MyAddresses />
        {showExportOption && <ExportCard />}
      </div>
    </div>
    <div className="dashboard mobile">
      <Balance
        balance={balance}
        reloadWalletInfo={reloadWalletInfo}
        conversionRates={conversionRates}
      />
      <DashboardMobileContent
        transactionHistory={transactionHistory}
        conversionRates={conversionRates}
      />
      {showExportOption && <ExportCard />}
    </div>
  </div>
))

export default TxHistoryPage
