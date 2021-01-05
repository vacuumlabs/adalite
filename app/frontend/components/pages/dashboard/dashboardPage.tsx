import {h, Component, Fragment} from 'preact'
import {connect} from '../../../helpers/connect'
import actions from '../../../actions'
import Balance from '../../common/balance'
import TransactionHistory from '../txHistory/transactionHistory'
import ExportCard from '../exportWallet/exportCard'
import SendAdaPage from '../sendAda/sendAdaPage'
import MyAddresses from '../receiveAda/myAddresses'
import DelegatePage from '../delegations/delegatePage'
import CurrentDelegationPage from '../delegations/currentDelegationPage'
import StakingHistoryPage from '../delegations/stakingHistoryPage'
import ShelleyBalances from '../delegations/shelleyBalances'
import {ADALITE_CONFIG} from '.././../../config'
import {MainTab, SubTab} from './tabs'
import InfoModal from '../../common/infoModal'
import NotShelleyCompatibleDialog from '../login/nonShelleyCompatibleDialog'
import DashboardErrorBanner from './dashboardErrorBanner'
import PremiumBanner from './premiumBanner'
import SaturationErrorBanner from './saturationErrorBanner'
import Keys from '../advanced/keys'
import AccountsDashboard from '../accounts/accountsDashboard'
import {State} from '../../../state'
import PoolOwner from '../advanced/poolOwner'
import ErrorModals from './errorModals'

interface Props {
  selectedMainTab: any
  selectMainTab?: (value: string) => void
}

const StakingPage = () => {
  return (
    <div className="dashboard desktop">
      <div className="dashboard-column">
        <ShelleyBalances />
        <StakingHistoryPage />
      </div>
      <div className="dashboard-column">
        <DelegatePage />
        <CurrentDelegationPage />
      </div>
    </div>
  )
}

const SendingPage = ({shouldShowExportOption}) => {
  return (
    <Fragment>
      <div className="dashboard-column">
        <Balance />
        <TransactionHistory />
      </div>
      <div className="dashboard-column">
        <SendAdaPage />
        <MyAddresses />
        {shouldShowExportOption && <ExportCard />}
      </div>
    </Fragment>
  )
}

const AdvancedPage = () => {
  return (
    <Fragment>
      <div className="dashboard-column">
        <Keys />
      </div>
      <div className="dashboard-column">
        <PoolOwner />
      </div>
    </Fragment>
  )
}

const AccountsPage = () => {
  return <AccountsDashboard />
}

class DashboardPage extends Component<Props> {
  constructor(props) {
    super(props)
    this.selectMainTab = this.selectMainTab.bind(this)
  }

  selectMainTab(name) {
    this.props.selectMainTab(name)
  }

  render({
    shouldShowExportOption,
    selectedMainTab,
    isShelleyCompatible,
    shouldShowNonShelleyCompatibleDialog,
    displayInfoModal,
    shouldShowPremiumBanner,
    shouldShowSaturatedBanner,
    activeAccountIndex,
    shouldNumberAccountsFromOne,
  }) {
    // TODO: this approach doesnt allow multi-word tabs
    const mainTabs = ['Accounts', 'Sending', 'Staking', 'Advanced']
    // TODO: refactor this ^ to array of objects
    const displayedPages = {
      Accounts: <AccountsPage />,
      Sending: <SendingPage shouldShowExportOption={shouldShowExportOption} />,
      Staking: <StakingPage />,
      Advanced: <AdvancedPage />,
    }
    const displayedSubPages = {
      Accounts: <div />,
      Sending: <Balance />,
      Staking: <ShelleyBalances />,
      Advanced: <div />,
    }
    return (
      <div className="page-wrapper">
        <ErrorModals />
        {isShelleyCompatible && displayInfoModal && <InfoModal />}
        {shouldShowNonShelleyCompatibleDialog && <NotShelleyCompatibleDialog />}
        {!isShelleyCompatible && <DashboardErrorBanner />}
        {shouldShowPremiumBanner && <PremiumBanner />}
        {shouldShowSaturatedBanner && <SaturationErrorBanner />}
        {ADALITE_CONFIG.ADALITE_CARDANO_VERSION === 'shelley' && (
          <ul className="tabinator">
            {mainTabs.map((name, i) => (
              <MainTab
                key={i}
                name={name}
                selectedTab={selectedMainTab}
                selectTab={this.selectMainTab}
                displayName={
                  name === 'Accounts' &&
                  (shouldNumberAccountsFromOne
                    ? `Account #${activeAccountIndex + 1}`
                    : `Account ${activeAccountIndex}`)
                }
              />
            ))}
          </ul>
        )}
        <div className="dashboard desktop">{displayedPages[selectedMainTab]}</div>

        <div className="dashboard mobile">
          {displayedSubPages[selectedMainTab]}
          <DashboardMobileContent selectedMainTab={selectedMainTab} />
          {selectedMainTab === 'Sending' && shouldShowExportOption && <ExportCard />}
        </div>
      </div>
    )
  }
}

class DashboardMobileContent extends Component<Props, {selectedSubTab}> {
  constructor(props) {
    super(props)
    this.state = {
      selectedSubTab: 'Transactions',
    }
    this.selectSubTab = this.selectSubTab.bind(this)
  }
  selectSubTab(name) {
    if (this.state.selectedSubTab !== name) {
      this.setState({selectedSubTab: name})
    }
  }
  pages = {
    'Delegate ADA': DelegatePage,
    'Current Delegation': CurrentDelegationPage,
    'Staking history': StakingHistoryPage,
    'Send ADA': SendAdaPage,
    'Transactions': TransactionHistory,
    'Recieve ADA': MyAddresses,
    Keys,
    'Accounts': AccountsDashboard,
    'Certificate': PoolOwner,
  }
  // TODO: refactor
  accountsTabs = ['Accounts']
  stakingTabs = ['Delegate ADA', 'Current Delegation', 'Staking history']
  sendingTabs = ['Send ADA', 'Transactions', 'Receive ADA']
  advancedTabs = ['Keys', 'Certificate']
  render({selectedMainTab}, {selectedSubTab}) {
    const selectedDefultSubTabs = {
      Accounts: 'Accounts',
      Sending: 'Transactions',
      Staking: 'Delegate ADA',
      Advanced: 'Keys',
    }
    const tabs = {
      Accounts: this.accountsTabs,
      Sending: this.sendingTabs,
      Staking: this.stakingTabs,
      Advanced: this.advancedTabs,
    }
    if (!tabs[selectedMainTab].includes(selectedSubTab)) {
      this.selectSubTab(selectedDefultSubTabs[selectedMainTab])
    }
    const Page = this.pages[selectedSubTab]
    return (
      <div className="dashboard-content">
        <ul className="dashboard-tabs">
          {tabs[selectedMainTab].map((name, i) => (
            <SubTab
              key={i}
              name={name}
              selectedTab={selectedSubTab}
              selectTab={this.selectSubTab}
            />
          ))}
        </ul>
        <Page />
      </div>
    )
  }
}

export default connect(
  (state: State) => ({
    shouldShowExportOption: state.shouldShowExportOption,
    selectedMainTab: state.selectedMainTab,
    displayInfoModal: state.displayInfoModal,
    isShelleyCompatible: state.isShelleyCompatible,
    shouldShowNonShelleyCompatibleDialog: state.shouldShowNonShelleyCompatibleDialog,
    shouldShowPremiumBanner: state.shouldShowPremiumBanner,
    shouldShowSaturatedBanner: state.shouldShowSaturatedBanner,
    activeAccountIndex: state.activeAccountIndex,
    shouldNumberAccountsFromOne: state.shouldNumberAccountsFromOne,
  }),
  actions
)(DashboardPage)
