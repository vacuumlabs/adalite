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
import DelegationHistory from '../delegations/delegationHistory'
import StakingPageToggle from '../../common/stakingPageToggle'
import StakingBalances from '../../common/stakingBalances'

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
  render(
    {transactionHistory, delegationHistory, conversionRates, displayStakingPage},
    {selectedTab}
  ) {
    const dashboardTab = (tabName, tabText) => (
      <li
        className={`dashboard-tab ${tabName === selectedTab ? 'selected' : ''}`}
        onClick={() => this.changeTab(tabName)}
      >
        {tabText}
      </li>
    )

    const stakingTabs = ['delegate', 'delegation-history', 'current-delegation']
    const sendingTabs = ['send', 'transactions', 'receive']

    if (displayStakingPage && sendingTabs.includes(selectedTab)) {
      this.changeTab('delegate')
    }
    if (!displayStakingPage && stakingTabs.includes(selectedTab)) {
      this.changeTab('transactions')
    }

    return (
      <div className="dashboard-content">
        <ul className="dashboard-tabs">
          {displayStakingPage
            ? [
                dashboardTab('delegate', 'Delegate ADA'),
                dashboardTab('current-delegation', 'Current Delegation'),
                dashboardTab('delegation-history', 'Delegation History'),
              ]
            : [
                dashboardTab('transactions', 'Transactions'),
                dashboardTab('send', 'Send ADA'),
                dashboardTab('receive', 'Receive ADA'),
              ]}
        </ul>
        {displayStakingPage
          ? [
              selectedTab === 'delegate' && <DelegatePage />,
              selectedTab === 'delegation-history' && (
                <DelegationHistory delegationHistory={delegationHistory} />
              ),
              selectedTab === 'current-delegation' && <CurrentDelegationPage />,
            ]
          : [
              selectedTab === 'send' && <SendAdaPage />,
              selectedTab === 'transactions' && (
                <TransactionHistory
                  transactionHistory={transactionHistory}
                />
              ),
              selectedTab === 'receive' && <MyAddresses />,
            ]}
      </div>
    )
  }
}

const TxHistoryPage = connect(
  (state) => ({
    stakingBalance: state.stakingBalance,
    nonStakingBalance: state.nonStakingBalance,
    balance: state.balance,
    rewards: state.rewards,
    transactionHistory: state.transactionHistory,
    delegationHistory: state.delegationHistory,
    conversionRates: state.conversionRates && state.conversionRates.data,
    showExportOption: state.showExportOption,
    displayStakingPage: state.displayStakingPage,
  }),
  actions
)(
  ({
    stakingBalance,
    nonStakingBalance,
    balance,
    rewards,
    transactionHistory,
    delegationHistory,
    reloadWalletInfo,
    conversionRates,
    showExportOption,
    displayStakingPage,
  }) => (
    <div className="page-wrapper">
      <StakingPageToggle />
      <div className="dashboard desktop">
        <div className="dashboard-column">
          {displayStakingPage
            ? [
                <StakingBalances
                  stakingBalance={stakingBalance}
                  nonStakingBalance={nonStakingBalance}
                  rewards={rewards}
                  balance={balance}
                  reloadWalletInfo={reloadWalletInfo}
                />,
                <CurrentDelegationPage />,
              ]
            : [
                <Balance
                  balance={balance}
                  reloadWalletInfo={reloadWalletInfo}
                  conversionRates={conversionRates}
                />,
                <TransactionHistory
                  transactionHistory={transactionHistory}
                />,
              ]}
        </div>
        <div className="dashboard-column">
          {displayStakingPage
            ? [<DelegatePage />, <DelegationHistory delegationHistory={delegationHistory} />]
            : [<SendAdaPage />, <MyAddresses />, showExportOption && <ExportCard />]}
        </div>
      </div>
      <div className="dashboard mobile">
        {displayStakingPage ? (
          <StakingBalances
            stakingBalance={stakingBalance}
            nonStakingBalance={nonStakingBalance}
            rewards={rewards}
            balance={balance}
            reloadWalletInfo={reloadWalletInfo}
          />
        ) : (
          <Balance
            balance={balance}
            reloadWalletInfo={reloadWalletInfo}
            conversionRates={conversionRates}
          />
        )}
        <DashboardMobileContent
          balance={balance}
          rewards={rewards}
          transactionHistory={transactionHistory}
          delegationHistory={delegationHistory}
          displayStakingPage={displayStakingPage}
          reloadWalletInfo={reloadWalletInfo}
          conversionRates={conversionRates}
        />
        {!displayStakingPage && showExportOption && <ExportCard />}
      </div>
    </div>
  )
)

export default TxHistoryPage
