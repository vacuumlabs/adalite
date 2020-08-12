import {h, Component} from 'preact'
import {connect} from '../../../helpers/connect'
import actions from '../../../actions'
import Balance from '../../common/balance'
import TransactionHistory from '../txHistory/transactionHistory'
import ExportCard from '../exportWallet/exportCard'
import SendAdaPage from '../sendAda/sendAdaPage'
import MyAddresses from '../receiveAda/myAddresses'
import DelegatePage from '../delegations/delegatePage'
import CurrentDelegationPage from '../delegations/currentDelegationPage'
// import DelegationHistory from '../delegations/delegationHistory'
import ShelleyBalances from '../delegations/shelleyBalances'
import {ADALITE_CONFIG} from '.././../../config'
import {MainTab, SubTab} from './tabs'
import InfoModal from '../../common/infoModal'
import NotShelleyCompatibleDialog from '../login/nonShelleyCompatibleDialog'
import DashboardErrorBanner from './dashboardErrorBanner'

interface Props {
  displayStakingPage: any
  toggleDisplayStakingPage?: (value: boolean) => void
}

const StakingPage = () => {
  return (
    <div className="dashboard desktop">
      <div className="dashboard-column">
        <ShelleyBalances />
        <CurrentDelegationPage />
      </div>
      <div className="dashboard-column">
        <DelegatePage />
        {/* <DelegationHistory /> */}
      </div>
    </div>
  )
}

const SendingPage = ({shouldShowExportOption}) => {
  return (
    <div className="dashboard desktop">
      <div className="dashboard-column">
        <Balance />
        <TransactionHistory />
      </div>
      <div className="dashboard-column">
        <SendAdaPage />
        <MyAddresses />
        {shouldShowExportOption && <ExportCard />}
      </div>
    </div>
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
    this.props.toggleDisplayStakingPage(name === 'Staking')
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
    const mainTabs = ['Sending', 'Staking']
    return (
      <div className="page-wrapper">
        {isShelleyCompatible && displayInfoModal && <InfoModal />}
        {shouldShowNonShelleyCompatibleDialog && <NotShelleyCompatibleDialog />}
        {!isShelleyCompatible && <DashboardErrorBanner />}
        {ADALITE_CONFIG.ADALITE_CARDANO_VERSION === 'shelley' &&
          isShelleyCompatible && (
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
        <div className="dashboard desktop">
          {!displayStakingPage ? (
            <SendingPage shouldShowExportOption={shouldShowExportOption} />
          ) : (
            <StakingPage />
          )}
        </div>

        <div className="dashboard mobile">
          {displayStakingPage ? <ShelleyBalances /> : <Balance />}
          <DashboardMobileContent displayStakingPage={displayStakingPage} />
          {!displayStakingPage && shouldShowExportOption && <ExportCard />}
        </div>
      </div>
    )
  }
}

class DashboardMobileContent extends Component<Props> {
  constructor(props) {
    super(props)
    this.state = {
      selectedSubTab: !this.props.displayStakingPage ? 'Transactions' : 'Delegate ADA',
    }
    this.selectSubTab = this.selectSubTab.bind(this)
  }
  selectSubTab(name) {
    this.setState({selectedSubTab: name})
  }
  pages = {
    'Delegate ADA': DelegatePage,
    'Current Delegation': CurrentDelegationPage,
    'Send ADA': SendAdaPage,
    'Transactions': TransactionHistory,
    'Recieve ADA': MyAddresses,
  }
  render({displayStakingPage}, {selectedSubTab}) {
    const stakingTabs = ['Delegate ADA', 'Current Delegation']
    const sendingTabs = ['Send ADA', 'Transactions', 'Recieve ADA']
    if (displayStakingPage && sendingTabs.includes(selectedSubTab)) {
      this.selectSubTab('Delegate ADA')
    }
    if (!displayStakingPage && stakingTabs.includes(selectedSubTab)) {
      this.selectSubTab('Transactions')
    }
    const Page = this.pages[selectedSubTab]
    return (
      <div className="dashboard-content">
        <ul className="dashboard-tabs">
          {(displayStakingPage ? stakingTabs : sendingTabs).map((name, i) => (
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
