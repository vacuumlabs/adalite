import {h, Fragment} from 'preact'
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
import {useState} from 'preact/hooks'
import {SubTabs, MainTabs} from '../../../constants'
import {useViewport, isSmallerThanDesktop} from '../../common/viewPort'
import {ScreenType} from '../../../types'

const StakingPage = ({screenType}: {screenType: ScreenType}) => {
  const subTabs = [SubTabs.DELEGATE_ADA, SubTabs.CURRENT_DELEGATION, SubTabs.STAKING_HISTORY]
  const defaultSubTab = SubTabs.DELEGATE_ADA
  const mainSubTab = SubTabs.SHELLEY_BALANCES
  return (
    <Fragment>
      {isSmallerThanDesktop(screenType) ? (
        <div className="dashboard mobile">
          <DashboardMobileContent
            subTabs={subTabs}
            defaultSubTab={defaultSubTab}
            mainSubTab={mainSubTab}
          />
        </div>
      ) : (
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
      )}
    </Fragment>
  )
}

const SendingPage = ({
  shouldShowExportOption,
  screenType,
}: {
  shouldShowExportOption: boolean
  screenType: ScreenType
}) => {
  const subTabs = [SubTabs.SEND_ADA, SubTabs.TRANSACTIONS, SubTabs.ADDRESSES]
  const defaultSubTab = SubTabs.TRANSACTIONS
  const mainSubTab = SubTabs.BALANCE
  return (
    <Fragment>
      {isSmallerThanDesktop(screenType) ? (
        <div className="dashboard mobile">
          <DashboardMobileContent
            subTabs={subTabs}
            defaultSubTab={defaultSubTab}
            mainSubTab={mainSubTab}
          />
          {shouldShowExportOption && <ExportCard />}
        </div>
      ) : (
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
      )}
    </Fragment>
  )
}

const AdvancedPage = ({screenType}: {screenType: ScreenType}) => {
  const subTabs = [SubTabs.POOL_OWNER]
  const defaultSubTab = SubTabs.POOL_OWNER
  const mainSubTab = SubTabs.KEYS
  return (
    <Fragment>
      {screenType < ScreenType.DESKTOP ? (
        <div className="dashboard mobile">
          <DashboardMobileContent
            subTabs={subTabs}
            defaultSubTab={defaultSubTab}
            mainSubTab={mainSubTab}
          />
        </div>
      ) : (
        <div className="dashboard desktop">
          <div className="dashboard-column">
            <Keys />
          </div>
          <div className="dashboard-column">
            <PoolOwner />
          </div>
        </div>
      )}
    </Fragment>
  )
}

const AccountsPage = ({screenType}: {screenType: ScreenType}) => {
  const subTabs = [SubTabs.ACCOUNTS]
  const defaultSubTab = SubTabs.ACCOUNTS
  return (
    <Fragment>
      {isSmallerThanDesktop(screenType) ? (
        <div className="dashboard mobile">
          <DashboardMobileContent subTabs={subTabs} defaultSubTab={defaultSubTab} />
        </div>
      ) : (
        <div className="dashboard desktop">
          <AccountsDashboard />
        </div>
      )}
    </Fragment>
  )
}

const SubPages: {[key in SubTabs]: any} = {
  [SubTabs.DELEGATE_ADA]: <DelegatePage />,
  [SubTabs.CURRENT_DELEGATION]: <CurrentDelegationPage />,
  [SubTabs.STAKING_HISTORY]: <StakingHistoryPage />,
  [SubTabs.SEND_ADA]: <SendAdaPage />,
  [SubTabs.TRANSACTIONS]: <TransactionHistory />,
  [SubTabs.ADDRESSES]: <MyAddresses />,
  [SubTabs.KEYS]: <Keys />,
  [SubTabs.ACCOUNTS]: <AccountsDashboard />,
  [SubTabs.POOL_OWNER]: <PoolOwner />,
  [SubTabs.BALANCE]: <Balance />,
  [SubTabs.SHELLEY_BALANCES]: <ShelleyBalances />,
}

type Props = {
  setActiveMainTab: (name: MainTabs) => void
  activeMainTab: MainTabs
  isShelleyCompatible: boolean
  shouldShowNonShelleyCompatibleDialog: boolean
  displayInfoModal: boolean
  shouldShowPremiumBanner: boolean
  shouldShowSaturatedBanner: boolean
  activeAccountIndex: number
  shouldNumberAccountsFromOne: boolean
  shouldShowExportOption: boolean
}

const DashboardPage = ({
  setActiveMainTab,
  activeMainTab,
  displayInfoModal,
  isShelleyCompatible,
  shouldShowNonShelleyCompatibleDialog,
  shouldShowPremiumBanner,
  shouldShowSaturatedBanner,
  activeAccountIndex,
  shouldNumberAccountsFromOne,
  shouldShowExportOption,
}: Props) => {
  const screenType = useViewport()

  const MainPages: {[key in MainTabs]: any} = {
    [MainTabs.ACCOUNT]: <AccountsPage screenType={screenType} />,
    [MainTabs.STAKING]: <StakingPage screenType={screenType} />,
    [MainTabs.SENDING]: (
      <SendingPage screenType={screenType} shouldShowExportOption={shouldShowExportOption} />
    ),
    [MainTabs.ADVANCED]: <AdvancedPage screenType={screenType} />,
  }
  return (
    <div className="page-wrapper">
      <ErrorModals />
      {isShelleyCompatible && displayInfoModal && <InfoModal />}
      {shouldShowNonShelleyCompatibleDialog && <NotShelleyCompatibleDialog />}
      {!isShelleyCompatible && <DashboardErrorBanner />}
      {shouldShowPremiumBanner && <PremiumBanner />}
      {shouldShowSaturatedBanner && <SaturationErrorBanner />}
      <ul className="tabinator">
        {Object.values(MainTabs).map((name, i) => (
          <MainTab
            key={i}
            name={name}
            isActive={name === activeMainTab}
            setActiveTab={setActiveMainTab}
            displayName={
              name === MainTabs.ACCOUNT &&
              (shouldNumberAccountsFromOne
                ? `Account #${activeAccountIndex + 1}`
                : `Account ${activeAccountIndex}`)
            }
          />
        ))}
      </ul>
      {MainPages[activeMainTab]}
    </div>
  )
}

type DashboardMobileProps = {
  subTabs: SubTabs[]
  defaultSubTab: SubTabs
  mainSubTab?: SubTabs
}

const DashboardMobileContent = ({subTabs, defaultSubTab, mainSubTab}: DashboardMobileProps) => {
  const [activeSubTab, setActiveSubTab] = useState(defaultSubTab)
  return (
    <div className="dashboard-content">
      {mainSubTab && SubPages[mainSubTab]}
      <ul className="dashboard-tabs">
        {subTabs.map((name, i) => (
          <SubTab
            key={i}
            name={name}
            isActive={name === activeSubTab}
            setActiveTab={setActiveSubTab}
          />
        ))}
      </ul>
      {SubPages[activeSubTab]}
    </div>
  )
}

export default connect(
  (state: State) => ({
    activeMainTab: state.activeMainTab,
    displayInfoModal: state.displayInfoModal,
    isShelleyCompatible: state.isShelleyCompatible,
    shouldShowNonShelleyCompatibleDialog: state.shouldShowNonShelleyCompatibleDialog,
    shouldShowPremiumBanner: state.shouldShowPremiumBanner,
    shouldShowSaturatedBanner: state.shouldShowSaturatedBanner,
    activeAccountIndex: state.activeAccountIndex,
    shouldNumberAccountsFromOne: state.shouldNumberAccountsFromOne,
    shouldShowExportOption: state.shouldShowExportOption,
  }),
  actions
)(DashboardPage)
