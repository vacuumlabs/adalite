import {Fragment, h} from 'preact'
import {connect} from '../../../helpers/connect'
import actions from '../../../actions'
import printAda from '../../../helpers/printAda'
import {Lovelace, State} from '../../../state'
import {AdaIcon} from '../../common/svg'

type TileProps = {
  accountIndex: number
  ticker: string | null
  availableBalance: Lovelace | null
  rewardsBalance: Lovelace | null
  setActiveAccount: any
  exploreNewAccount: any
  activeAccountIndex: number
  showDelegationModal: any
  showSendTransactionModal: any
  accountIndexOffset: number
  shouldShowAccountInfo?: boolean
}

const AccountTile = ({
  accountIndex,
  ticker,
  availableBalance,
  rewardsBalance,
  setActiveAccount,
  exploreNewAccount,
  activeAccountIndex,
  showDelegationModal,
  showSendTransactionModal,
  accountIndexOffset,
  shouldShowAccountInfo,
}: TileProps) => {
  const isActive = activeAccountIndex === accountIndex
  const displayedAccountIndex = accountIndex + accountIndexOffset

  const Balance = ({value}: {value: Lovelace}) =>
    value !== null ? (
      <Fragment>
        {printAda(value, 3)}
        <AdaIcon />
      </Fragment>
    ) : (
      <Fragment>-</Fragment>
    )

  const TransferButton = () => (
    <button
      className="button primary nowrap account-button"
      onClick={() => showSendTransactionModal(activeAccountIndex, accountIndex)}
      disabled={isActive}
    >
      Transfer
    </button>
  )

  const DelegateButton = () => (
    <button
      className="button primary nowrap account-button"
      onClick={() => {
        showDelegationModal(accountIndex)
      }}
    >
      Delegate
    </button>
  )

  const ActivationButton = () => (
    <button
      className="button primary nowrap"
      disabled={isActive}
      onClick={() => {
        setActiveAccount(accountIndex)
      }}
    >
      {isActive ? 'Active' : 'Activate'}
    </button>
  )

  const ExplorationButton = () => (
    <button
      className="button primary nowrap"
      onClick={() => {
        exploreNewAccount()
      }}
    >
      Explore
    </button>
  )

  return (
    <div key={accountIndex} className={`card account ${isActive ? 'selected' : ''}`}>
      <div className="header-wrapper mobile">
        <h2 className="card-title small-margin">Account #{displayedAccountIndex}</h2>
      </div>
      <div className="card-column account-button-wrapper">
        <h2 className="card-title small-margin account-header desktop">
          Account #{displayedAccountIndex}
        </h2>
        {shouldShowAccountInfo ? <ActivationButton /> : <ExplorationButton />}
      </div>
      <div className="card-column account-item-info-wrapper">
        <h2 className="card-title small-margin">Available balance</h2>
        <div className="balance-amount small item">
          <Balance value={availableBalance} />
        </div>
        <div className="mobile">
          {shouldShowAccountInfo && (
            <div className="account-action-buttons">
              <TransferButton />
            </div>
          )}
        </div>
      </div>
      <div className="card-column account-item-info-wrapper tablet-offset">
        <h2 className="card-title small-margin">Rewards balance</h2>
        <div className="balance-amount small item">
          <Balance value={rewardsBalance} />
        </div>
      </div>
      <div className="card-column account-item-info-wrapper">
        <h2 className="card-title small-margin">Delegation</h2>
        <div className="delegation-account item">{ticker || '-'}</div>
        <div className="mobile">
          {shouldShowAccountInfo && (
            <div className="account-action-buttons">
              <DelegateButton />
            </div>
          )}
        </div>
      </div>
      {shouldShowAccountInfo ? (
        <div className="account-action-buttons desktop">
          <TransferButton />
          <DelegateButton />
        </div>
      ) : (
        <div className="account-action-buttons desktop" style="width: 98px;" />
      )}
    </div>
  )
}

export default connect(
  (state: State) => ({
    accountsInfo: state.accountsInfo,
    shouldShowSendTransactionModal: state.shouldShowSendTransactionModal,
    shouldShowDelegationModal: state.shouldShowDelegationModal,
    activeAccountIndex: state.activeAccountIndex,
    accountIndexOffset: state.accountIndexOffset,
  }),
  actions
)(AccountTile)
