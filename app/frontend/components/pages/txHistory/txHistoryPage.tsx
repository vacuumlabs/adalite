import {h, Component} from 'preact'
import {connect} from '../../../helpers/connect'
import actions from '../../../actions'
import Balance from '../../common/balance'
import TransactionHistory from './transactionHistory'
import ExportCard from '../exportWallet/exportCard'
import SendAdaPage from '../sendAda/sendAdaPage'
import MyAddresses from '../receiveAda/myAddresses'
import DelegatePage from '../delegations/delegatePage'
import CurrentDelegationPage from '../delegations/currentDelegationPage'
// import DelegationHistory from '../delegations/delegationHistory'
import StakingPageToggle from '../../common/stakingPageToggle'
import ShelleyBalances from '../delegations/shelleyBalances'
import {ADALITE_CONFIG} from '.././../../config'
import MainTab from './mainTab'

interface Props {
  transactionHistory: any
  // delegationHistory: any
  displayStakingPage: any
  toggleDisplayStakingPage?: (value: boolean) => void
}

const StakingTab = () => {
  return (
    <div className="dashboard desktop">
      <div className="dashboard-column">
        <ShelleyBalances />,
        <CurrentDelegationPage />
      </div>
      <div className="dashboard-column">
        <DelegatePage />,
        {/* <DelegationHistory /> */}
      </div>
    </div>
  )
}

const SendingTab = ({
  balance,
  transactionHistory,
  reloadWalletInfo,
  conversionRates,
  showExportOption,
}) => {
  return (
    <div className="dashboard desktop">
      <div className="dashboard-column">
        <Balance
          balance={balance}
          reloadWalletInfo={reloadWalletInfo}
          conversionRates={conversionRates}
        />,
        <TransactionHistory />,
      </div>
      <div className="dashboard-column">
        <SendAdaPage />,
        <MyAddresses />,
        {showExportOption && <ExportCard />}
      </div>
    </div>
  )
}

class TxHistoryPage extends Component<Props> {
  //TODO rename to walletpage or dashboard
  constructor(props) {
    super(props)
    this.state = {
      mainTabSelected: 'Staking',
    }
    this.selectMainTab = this.selectMainTab.bind(this)
  }

  selectMainTab(name) {
    this.setState({
      mainTabSelected: name,
    })
    this.props.toggleDisplayStakingPage(name === 'Staking')
  }

  render(
    {
      balance,
      transactionHistory,
      // delegationHistory,
      reloadWalletInfo,
      conversionRates,
      showExportOption,
      displayStakingPage,
    },
    {mainTabSelected}
  ) {
    const mainTabs = ['Sending', 'Staking']
    return (
      <div className="page-wrapper">
        {ADALITE_CONFIG.ADALITE_CARDANO_VERSION === 'shelley' && (
          <ul className="tabinator">
            {mainTabs.map((name) => (
              <MainTab name={name} selectedTab={mainTabSelected} selectTab={this.selectMainTab} />
            ))}
          </ul>
        )}
        <div className="dashboard desktop">
          {!displayStakingPage ? (
            <SendingTab
              balance={balance}
              transactionHistory={transactionHistory}
              reloadWalletInfo={reloadWalletInfo}
              conversionRates={conversionRates}
              showExportOption
            />
          ) : (
            <StakingTab />
          )}
        </div>

        <div className="dashboard mobile">
          {displayStakingPage ? (
            <ShelleyBalances />
          ) : (
            <Balance
              balance={balance}
              reloadWalletInfo={reloadWalletInfo}
              conversionRates={conversionRates}
            />
          )}
          <DashboardMobileContent
            transactionHistory={transactionHistory}
            // delegationHistory={delegationHistory}
            displayStakingPage={displayStakingPage}
          />
          {!displayStakingPage && showExportOption && <ExportCard />}
        </div>
      </div>
    )
  }
}

const DashboardTab = ({name, selectedTab, selectTab}) => (
  <li
    className={`dashboard-tab ${name === selectedTab ? 'selected' : ''}`}
    onClick={() => selectTab(name)}
  >
    {name}
  </li>
)

class DashboardMobileContent extends Component<Props> {
  constructor(props) {
    super(props)
    this.state = {
      selectedTab: !this.props.displayStakingPage ? 'Transactions' : 'Delegate ADA',
    }
    this.selectSubTab = this.selectSubTab.bind(this)
  }
  selectSubTab(tabName) {
    this.setState({selectedTab: tabName})
  }
  render({transactionHistory, delegationHistory, displayStakingPage}, {selectedTab}) {
    const stakingTabs = ['Delegate ADA', 'Current Delegation']
    const sendingTabs = ['Send ADA', 'Transactions', 'Recieve ADA']
    const displayingTabs = displayStakingPage ? stakingTabs : sendingTabs
    if (displayStakingPage && sendingTabs.includes(selectedTab)) {
      this.selectSubTab('Delegate ADA')
    }
    if (!displayStakingPage && stakingTabs.includes(selectedTab)) {
      this.selectSubTab('Transactions')
    }
    const tabs = {
      'Delegate ADA': DelegatePage,
      'Current Delegation': CurrentDelegationPage,
      'Send ADA': SendAdaPage,
      'Transactions': TransactionHistory,
      'Recieve ADA': MyAddresses,
    }
    const Tab = tabs[selectedTab]
    return (
      <div className="dashboard-content">
        <ul className="dashboard-tabs">
          {displayingTabs.map((name) => (
            <DashboardTab name={name} selectedTab={selectedTab} selectTab={this.selectSubTab} />
          ))}
        </ul>
        <Tab />
      </div>
    )
  }
}

export default connect(
  (state) => ({
    transactionHistory: state.transactionHistory,
    conversionRates: state.conversionRates && state.conversionRates.data,
    showExportOption: state.showExportOption,
    displayStakingPage: state.displayStakingPage,
    balance: state.balance,
  }),
  actions
)(TxHistoryPage)
