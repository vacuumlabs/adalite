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
import Keys from '../advanced/keys'

interface Props {
  displayStakingPage: any
  toggleDisplayStakingPage?: (value: string) => void
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
        <div />
      </div>
    </Fragment>
  )
}

class DashboardPage extends Component<Props> {
  constructor(props) {
    super(props)
    this.state = {
      selectedMainTab: 'Sending',
    }
    this.selectMainTab = this.selectMainTab.bind(this)
  }

  selectMainTab(name) {
    this.setState({
      selectedMainTab: name,
    })
    this.props.toggleDisplayStakingPage(name)
  }

  render(
    {
      shouldShowExportOption,
      displayStakingPage,
      isShelleyCompatible,
      shouldShowNonShelleyCompatibleDialog,
      displayInfoModal,
    },
    {selectedMainTab}
  ) {
    const mainTabs = ['Sending', 'Staking', 'Advanced']
    const displayedPages = {
      Sending: <SendingPage shouldShowExportOption={shouldShowExportOption} />,
      Staking: <StakingPage />,
      Advanced: <AdvancedPage />,
    }
    const displayedSubPages = {
      Sending: <Balance />,
      Staking: <ShelleyBalances />,
      Advanced: <div />,
    }
    return (
      <div className="page-wrapper">
        {isShelleyCompatible && displayInfoModal && <InfoModal />}
        {shouldShowNonShelleyCompatibleDialog && <NotShelleyCompatibleDialog />}
        {!isShelleyCompatible && <DashboardErrorBanner />}
        {ADALITE_CONFIG.ADALITE_CARDANO_VERSION === 'shelley' && (
          <ul className="tabinator">
            {mainTabs.map((name, i) => (
              <MainTab
                key={i}
                name={name}
                selectedTab={selectedMainTab}
                selectTab={this.selectMainTab}
              />
            ))}
          </ul>
        )}
        <div className="dashboard desktop">{displayedPages[displayStakingPage]}</div>

        <div className="dashboard mobile">
          {displayedSubPages[displayStakingPage]}
          <DashboardMobileContent displayStakingPage={displayStakingPage} />
          {displayStakingPage === 'Sending' && shouldShowExportOption && <ExportCard />}
        </div>
      </div>
    )
  }
}

class DashboardMobileContent extends Component<Props, {selectedSubTab}> {
  constructor(props) {
    super(props)
    const selectedSubTabs = {
      Sending: 'Transactions',
      Staking: 'Delegate ADA',
      Advanced: 'Keys',
    }
    this.state = {
      selectedSubTab: selectedSubTabs[this.props.displayStakingPage],
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
  }
  stakingTabs = ['Delegate ADA', 'Current Delegation', 'Staking history']
  sendingTabs = ['Send ADA', 'Transactions', 'Recieve ADA']
  advancedTabs = ['Keys']
  render({displayStakingPage}, {selectedSubTab}) {
    const tabs = {
      Sending: this.sendingTabs,
      Staking: this.stakingTabs,
      Advanced: this.advancedTabs,
    }
    if (displayStakingPage === 'Sending') {
      this.selectSubTab(selectedSubTab)
    }
    if (displayStakingPage === 'Staking') {
      this.selectSubTab(selectedSubTab)
    }
    if (displayStakingPage === 'Advanced') {
      this.selectSubTab(selectedSubTab)
    }
    const Page = this.pages[selectedSubTab]
    return (
      <div className="dashboard-content">
        <ul className="dashboard-tabs">
          {tabs[displayStakingPage].map((name, i) => (
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
  (state) => ({
    shouldShowExportOption: state.shouldShowExportOption,
    displayStakingPage: state.displayStakingPage,
    displayInfoModal: state.displayInfoModal,
    isShelleyCompatible: state.isShelleyCompatible,
    shouldShowNonShelleyCompatibleDialog: state.shouldShowNonShelleyCompatibleDialog,
  }),
  actions
)(DashboardPage)
