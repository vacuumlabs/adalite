import {Fragment, h} from 'preact'
import {useSelector, useActions} from '../../../helpers/connect'
import actions from '../../../actions'
import printAda from '../../../helpers/printAda'
import {AdaIcon} from '../../common/svg'
import tooltip from '../../common/tooltip'
import {Lovelace} from '../../../types'
import {formatAccountIndex} from '../../../helpers/formatAccountIndex'
import {shouldDisableSendingButton} from '../../../helpers/common'

type TileProps = {
  accountIndex: number
  ticker: string | null
  availableBalance: number | null
  rewardsBalance: number | null | undefined
  shouldShowSaturatedBanner: boolean
  shouldShowAccountInfo?: boolean
}

const AccountTile = ({
  accountIndex,
  ticker,
  availableBalance,
  rewardsBalance,
  shouldShowSaturatedBanner,
  shouldShowAccountInfo,
}: TileProps) => {
  const {
    setActiveAccount,
    exploreNextAccount,
    showDelegationModal,
    showSendTransactionModal,
  } = useActions(actions)
  const {activeAccountIndex, walletOperationStatusType} = useSelector((state) => ({
    activeAccountIndex: state.activeAccountIndex,
    walletOperationStatusType: state.walletOperationStatusType,
  }))
  const isActive = activeAccountIndex === accountIndex
  const accountLabel = `Account ${formatAccountIndex(accountIndex)}`

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
      {...tooltip(
        'Cannot send funds while transaction is pending or reloading',
        shouldDisableSendingButton(walletOperationStatusType)
      )}
      className="button primary nowrap account-button"
      onClick={() => showSendTransactionModal(activeAccountIndex, accountIndex)}
      disabled={isActive || shouldDisableSendingButton(walletOperationStatusType)}
      data-cy="AccountTileTransferBtn"
    >
      Transfer
    </button>
  )

  const DelegateButton = () => (
    <button
      {...tooltip(
        'Cannot delegate funds while transaction is pending or reloading',
        shouldDisableSendingButton(walletOperationStatusType)
      )}
      className="button primary nowrap account-button"
      onClick={() => {
        showDelegationModal(accountIndex)
      }}
      disabled={shouldDisableSendingButton(walletOperationStatusType)}
      data-cy="AccountTileDelegateBtn"
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
      data-cy="AccountTileActivateBtn"
    >
      {isActive ? 'Active' : 'Activate'}
    </button>
  )

  const ExplorationButton = () => (
    <button
      className="button primary nowrap"
      onClick={() => {
        exploreNextAccount()
      }}
    >
      Explore
    </button>
  )

  return (
    <div
      key={accountIndex}
      className={`card account ${isActive ? 'selected' : ''}`}
      data-cy="AccountTile"
    >
      <div className="header-wrapper mobile">
        <h2 className="card-title small-margin">{accountLabel}</h2>
      </div>
      <div className="card-column account-button-wrapper">
        <h2 className="card-title small-margin account-header desktop">{accountLabel}</h2>
        {shouldShowAccountInfo ? <ActivationButton /> : <ExplorationButton />}
      </div>
      <div className="card-column account-item-info-wrapper">
        <h2 className="card-title small-margin">Available balance</h2>
        <div className="balance-amount small item">
          <Balance value={availableBalance as Lovelace} />
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
          <Balance value={rewardsBalance as Lovelace} />
        </div>
      </div>
      <div className="card-column account-item-info-wrapper">
        <h2 className="card-title small-margin">Delegation</h2>
        <div className="delegation-account item">
          {ticker || '-'}
          {shouldShowSaturatedBanner && (
            <a
              {...tooltip(
                'This pool is saturated. Delegate to a different pool to earn optimal rewards.',
                true
              )}
            >
              <span className="show-warning">{''}</span>
            </a>
          )}
        </div>
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

export default AccountTile
