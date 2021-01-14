import {Fragment, h} from 'preact'
import {connect} from '../../../helpers/connect'
import actions from '../../../actions'
import printAda from '../../../helpers/printAda'
import {Lovelace, State} from '../../../state'
import {AdaIcon} from '../../common/svg'
import Alert from '../../common/alert'
import SendTransactionModal from './sendTransactionModal'
import DelegationModal from './delegationModal'
import ConfirmTransactionDialog from '../../../../frontend/components/pages/sendAda/confirmTransactionDialog'
import {errorHasHelp} from '../../../../frontend/helpers/errorsWithHelp'
import TransactionErrorModal from '../sendAda/transactionErrorModal'
import {getTranslation} from '../../../../frontend/translations'
import AccountTile from './accountTile'

type DashboardProps = {
  accountsInfo: Array<any>
  setActiveAccount: any
  exploreNewAccount: any
  reloadWalletInfo: any
  showSendTransactionModal: boolean
  showDelegationModal: boolean
  shouldShowSendTransactionModal: boolean
  shouldShowDelegationModal: boolean
  activeAccountIndex: number
  totalWalletBalance: number
  totalRewardsBalance: number
  shouldShowConfirmTransactionDialog: boolean
  shouldShowTransactionErrorModal: boolean
  transactionSubmissionError: any
  closeTransactionErrorModal: any
  accountIndexOffset: number
}

const AccountsDashboard = ({
  accountsInfo,
  setActiveAccount,
  exploreNewAccount,
  reloadWalletInfo,
  showSendTransactionModal,
  showDelegationModal,
  shouldShowSendTransactionModal,
  shouldShowDelegationModal,
  activeAccountIndex,
  totalWalletBalance,
  totalRewardsBalance,
  shouldShowConfirmTransactionDialog,
  shouldShowTransactionErrorModal,
  transactionSubmissionError,
  closeTransactionErrorModal,
  accountIndexOffset,
}: DashboardProps) => {
  const InfoAlert = () => (
    <Fragment>
      <div className="dashboard-column account sidebar-item info">
        <Alert alertType="info sidebar">
          <p>
            <strong>Accounts</strong> offer a way to split your funds. You are able to delegate to
            different pool from each account. Each account has different set of addresses and keys.
          </p>
        </Alert>
      </div>
      <div className="dashboard-column account sidebar-item info">
        <Alert alertType="info sidebar">
          <p>
            Click explore/activate button to load data for related account. If you are using
            hardware wallet, you will be requested to export public key.
          </p>
        </Alert>
      </div>
      <div className="dashboard-column account info">
        <Alert alertType="warning sidebar">
          <p>
            This feature might not be supported on other wallets yet. If you decide to move your
            funds to <strong>account</strong> other then <strong>account 0</strong>, you might not
            see your funds in other wallets.
          </p>
        </Alert>
      </div>
    </Fragment>
  )

  return (
    <Fragment>
      {shouldShowSendTransactionModal && <SendTransactionModal />}
      {shouldShowDelegationModal && <DelegationModal />}
      <div className="dashboard-column account">
        <div className="card account-aggregated">
          <div className="balance">
            <div className="item">
              <h2 className="card-title small-margin">Total balance</h2>
              <div className="balance-amount">
                {printAda(totalWalletBalance as Lovelace)}
                <AdaIcon />
              </div>
            </div>
            <div className="item">
              <h2 className="card-title small-margin">Total rewards balance</h2>
              <div className="balance-amount">
                {printAda(totalRewardsBalance as Lovelace)}
                <AdaIcon />
              </div>
            </div>
          </div>
          <div className="refresh-wrapper">
            <button className="button secondary balance refresh" onClick={reloadWalletInfo}>
              Refresh
            </button>
          </div>
        </div>
        <div className="mobile">
          <InfoAlert />
        </div>
        <div className="accounts-wrapper">
          <div className="dashboard-column account list">
            <div>
              {accountsInfo.map((accountInfo) => (
                <AccountTile
                  key={accountInfo.accountIndex}
                  accountIndex={accountInfo.accountIndex}
                  ticker={accountInfo.shelleyAccountInfo.delegation.ticker}
                  availableBalance={
                    accountInfo.shelleyBalances.stakingBalance +
                    accountInfo.shelleyBalances.nonStakingBalance
                  } // TODO: this should be in state}
                  rewardsBalance={accountInfo.shelleyBalances.rewardsAccountBalance}
                  shouldShowAccountInfo
                />
              ))}
              {accountsInfo[accountsInfo.length - 1].isUsed && (
                <AccountTile
                  accountIndex={accountsInfo.length}
                  ticker={null}
                  availableBalance={null}
                  rewardsBalance={null}
                />
              )}
            </div>
          </div>
          <div className="desktop">
            <InfoAlert />
          </div>
        </div>
      </div>
      {shouldShowTransactionErrorModal && (
        <TransactionErrorModal
          onRequestClose={closeTransactionErrorModal}
          errorMessage={getTranslation(
            transactionSubmissionError.code,
            transactionSubmissionError.params
          )}
          showHelp={errorHasHelp(transactionSubmissionError.code)}
        />
      )}
      {shouldShowConfirmTransactionDialog && <ConfirmTransactionDialog />}
    </Fragment>
  )
}

export default connect(
  (state: State) => ({
    isDemoWallet: state.isDemoWallet,
    accountsInfo: state.accountsInfo,
    shouldShowSendTransactionModal: state.shouldShowSendTransactionModal,
    shouldShowDelegationModal: state.shouldShowDelegationModal,
    activeAccountIndex: state.activeAccountIndex,
    totalRewardsBalance: state.totalRewardsBalance,
    totalWalletBalance: state.totalWalletBalance,
    shouldShowConfirmTransactionDialog: state.shouldShowConfirmTransactionDialog,
    shouldShowTransactionErrorModal: state.shouldShowTransactionErrorModal,
    transactionSubmissionError: state.transactionSubmissionError,
    accountIndexOffset: state.accountIndexOffset,
  }),
  actions
)(AccountsDashboard)
