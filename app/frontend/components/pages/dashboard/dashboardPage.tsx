import {h, Fragment} from 'preact'
import {useSelector, useActions} from '../../../helpers/connect'
import actions from '../../../actions'
import Balance from '../../common/balance'
import TransactionHistory from '../txHistory/transactionHistory'
import ExportCard from '../exportWallet/exportCard'
import SendAdaPage from '../sendAda/sendAdaPage'
import MultiAssetsPage from '../sendAda/multiAssetsPage'
import MyAddresses from '../receiveAda/myAddresses'
import DelegatePage from '../delegations/delegatePage'
import DeregisterStakeKeyPage from '../delegations/deregisterStakeKey'
import CurrentDelegationPage from '../delegations/currentDelegationPage'
import StakingHistoryPage from '../delegations/stakingHistoryPage'
import ShelleyBalances from '../delegations/shelleyBalances'
import {MainTab, SubTab} from './tabs'
import InfoModal from '../../common/infoModal'
import NotShelleyCompatibleDialog from '../login/nonShelleyCompatibleDialog'
import WantedAddressesModal from '../login/wantedAddressesModal'
import DashboardErrorBanner from './dashboardErrorBanner'
import PremiumBanner from './premiumBanner'
import SaturationErrorBanner from './saturationErrorBanner'
import Keys from '../advanced/keys'
import AccountsDashboard from '../accounts/accountsDashboard'
import PoolOwner from '../advanced/poolOwner'
import ErrorModals from './errorModals'
import {useState} from 'preact/hooks'
import {SubTabs, MainTabs} from '../../../constants'
import {useViewport, isSmallerThanDesktop} from '../../common/viewPort'
import {ScreenType} from '../../../types'
import {shouldShowExportOptionSelector, shouldShowPremiumBannerSelector} from '../../../selectors'
import ReceiveRedirect from '../receiveAda/receiveRedirect'
import {formatAccountIndex} from '../../../helpers/formatAccountIndex'
import ConfirmTransactionDialog from '../sendAda/confirmTransactionDialog'
import SendTransactionModal from '../accounts/sendTransactionModal'
import DelegationModal from '../accounts/delegationModal'
import VotingCard from '../voting/votingCard'
import VotingDialog from '../voting/votingDialog'

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
            <DeregisterStakeKeyPage />
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
  const subTabs = [SubTabs.SEND_ADA, SubTabs.TRANSACTIONS, SubTabs.MY_ADDRESSES_REDIRECT]
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
          <div className="dashboard-column shrinkable">
            <Balance />
            <TransactionHistory />
          </div>
          <div className="dashboard-column shrinkable">
            <SendAdaPage />
            <MultiAssetsPage />
            <ReceiveRedirect />
            {shouldShowExportOption && <ExportCard />}
          </div>
        </div>
      )}
    </Fragment>
  )
}

const ReceivePage = ({screenType}: {screenType: ScreenType}) => {
  const mainSubTab = SubTabs.ADDRESSES
  return (
    <Fragment>
      {isSmallerThanDesktop(screenType) ? (
        <div className="dashboard mobile">
          <DashboardMobileContent subTabs={[]} defaultSubTab={null} mainSubTab={mainSubTab} />
        </div>
      ) : (
        <div className="dashboard desktop">
          <MyAddresses />
        </div>
      )}
    </Fragment>
  )
}

const AdvancedPage = ({screenType}: {screenType: ScreenType}) => {
  const subTabs = []
  const defaultSubTab = null
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
            <div />
          </div>
        </div>
      )}
    </Fragment>
  )
}

const VotingPage = ({screenType}: {screenType: ScreenType}) => {
  const subTabs = []
  const defaultSubTab = null
  const mainSubTab = SubTabs.VOTING
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
            <VotingCard />
          </div>
          <div className="dashboard-column" />
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

const MobileSendAdaPage = () => (
  <Fragment>
    <SendAdaPage />
    <div className="mobile-multi-assets-page-wrapper">
      <MultiAssetsPage />
    </div>
  </Fragment>
)

const SubPages: {[key in SubTabs]: any} = {
  [SubTabs.DELEGATE_ADA]: <DelegatePage />,
  [SubTabs.CURRENT_DELEGATION]: (
    <Fragment>
      <CurrentDelegationPage />
      <DeregisterStakeKeyPage />
    </Fragment>
  ),
  [SubTabs.STAKING_HISTORY]: <StakingHistoryPage />,
  [SubTabs.SEND_ADA]: <MobileSendAdaPage />,
  [SubTabs.TRANSACTIONS]: <TransactionHistory />,
  [SubTabs.ADDRESSES]: <MyAddresses />,
  [SubTabs.KEYS]: <Keys />,
  [SubTabs.ACCOUNTS]: <AccountsDashboard />,
  [SubTabs.POOL_OWNER]: <PoolOwner />,
  [SubTabs.BALANCE]: <Balance />,
  [SubTabs.SHELLEY_BALANCES]: <ShelleyBalances />,
  [SubTabs.MY_ADDRESSES_REDIRECT]: <ReceiveRedirect />,
  [SubTabs.VOTING]: <VotingCard />,
}

const DashboardPage = () => {
  const {setActiveMainTab} = useActions(actions)
  const {
    activeMainTab,
    displayInfoModal,
    isShelleyCompatible,
    shouldShowNonShelleyCompatibleDialog,
    shouldShowPremiumBanner,
    shouldShowSaturatedBanner,
    activeAccountIndex,
    shouldShowExportOption,
    shouldShowWantedAddressesModal,
    shouldShowConfirmTransactionDialog,
    shouldShowSendTransactionModal,
    shouldShowDelegationModal,
    shouldShowVotingDialog,
  } = useSelector((state) => ({
    activeMainTab: state.activeMainTab,
    displayInfoModal: state.displayInfoModal,
    isShelleyCompatible: state.isShelleyCompatible,
    shouldShowNonShelleyCompatibleDialog: state.shouldShowNonShelleyCompatibleDialog,
    shouldShowPremiumBanner: shouldShowPremiumBannerSelector(state),
    shouldShowSaturatedBanner: state.shouldShowSaturatedBanner,
    activeAccountIndex: state.activeAccountIndex,
    shouldShowExportOption: shouldShowExportOptionSelector(state),
    shouldShowWantedAddressesModal: state.shouldShowWantedAddressesModal,
    shouldShowConfirmTransactionDialog: state.shouldShowConfirmTransactionDialog,
    shouldShowSendTransactionModal: state.shouldShowSendTransactionModal,
    shouldShowDelegationModal: state.shouldShowDelegationModal,
    shouldShowVotingDialog: state.shouldShowVotingDialog,
  }))

  const screenType = useViewport()

  const MainPages: {[key in MainTabs]: any} = {
    [MainTabs.ACCOUNT]: <AccountsPage screenType={screenType} />,
    [MainTabs.STAKING]: <StakingPage screenType={screenType} />,
    [MainTabs.SEND]: (
      <SendingPage screenType={screenType} shouldShowExportOption={shouldShowExportOption} />
    ),
    [MainTabs.RECEIVE]: <ReceivePage screenType={screenType} />,
    [MainTabs.ADVANCED]: <AdvancedPage screenType={screenType} />,
    [MainTabs.VOTING]: <VotingPage screenType={screenType} />,
  }
  return (
    <div className="page-wrapper">
      <ErrorModals />
      {/* `SendTransactionModal`, `DelegationModal`, VotingDialog should be before
      `ConfirmTransactionDialog` */}
      {shouldShowSendTransactionModal && <SendTransactionModal />}
      {shouldShowDelegationModal && <DelegationModal />}
      {shouldShowVotingDialog && <VotingDialog />}
      {shouldShowConfirmTransactionDialog && <ConfirmTransactionDialog />}
      {shouldShowWantedAddressesModal && <WantedAddressesModal />}
      {isShelleyCompatible && displayInfoModal && <InfoModal />}
      {shouldShowNonShelleyCompatibleDialog && <NotShelleyCompatibleDialog />}
      {!isShelleyCompatible && <DashboardErrorBanner />}
      {shouldShowPremiumBanner && <PremiumBanner />}
      {shouldShowSaturatedBanner && <SaturationErrorBanner />}

      <ul className="tabinator" data-cy="NavigationTabs">
        {/*
        REFACTOR: (calculateFee)
        "setActiveMainTab" should really just change tab, instead it does all the magic
        behind the scenes (e.g. calculate fee), this should be responsibility of screen of interest
        */}
        {Object.values(MainTabs).map((name, i) => (
          <MainTab
            key={i}
            name={name}
            isActive={name === activeMainTab}
            setActiveTab={setActiveMainTab}
            displayName={
              name === MainTabs.ACCOUNT && `Account ${formatAccountIndex(activeAccountIndex)}`
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

export default DashboardPage
