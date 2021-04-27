import {Fragment, h} from 'preact'
import printAda from '../../../helpers/printAda'
import {AdaIcon} from '../../common/svg'
import actions from '../../../actions'
import {connect} from '../../../libs/unistore/preact'
import tooltip from '../../common/tooltip'
import toLocalDate from '../../../../frontend/helpers/toLocalDate'
import {getActiveAccountInfo, State} from '../../../state'

const shelleyBalances = ({
  stakingBalance,
  nonStakingBalance,
  rewardsAccountBalance,
  balance,
  reloadWalletInfo,
  convertNonStakingUtxos,
  withdrawRewards,
  isShelleyCompatible,
  nearestReward,
}) => (
  <div className="rewards card">
    <h2 className="card-title staking-balances-title">
      Available balance
      <a
        {...tooltip(
          'Balance on your payment addresses available to be used in transactions. In order to add your Rewards Balance to Available Balance, you need to withdraw them.',
          true
        )}
      >
        <span className="show-info">{''}</span>
      </a>
    </h2>
    <div className="staking-balances-row">
      <div className="staking-balances-amount">
        {isNaN(Number(balance)) ? balance : `${printAda(balance)}`}
        <AdaIcon />
      </div>
      <button className="button secondary balance refresh" onClick={reloadWalletInfo}>
        Refresh
      </button>
    </div>

    <h2 className="card-title staking-balances-title">
      Rewards account balance
      <a
        className="wide-data-balloon"
        {...tooltip(
          'This value represents balance on your rewards account. It contains all rewards received from delegation that were not transferred yet to your Available balance. These rewards are automatically staked. You need to Withdraw Rewards only when you want to spend them. Withdraw Rewards button will appear only once you have some rewards in your Rewards Balance.',
          true
        )}
      >
        <span className="show-info">{''}</span>
      </a>
    </h2>
    <div className="staking-balances-row">
      <div className="staking-balances-amount">
        {isNaN(Number(rewardsAccountBalance))
          ? rewardsAccountBalance
          : `${printAda(rewardsAccountBalance)}`}
        <AdaIcon />
        {nearestReward && (
          <div className="staking-balance-next-reward">
            Next reward: {toLocalDate(new Date(nearestReward.rewardDate))}
          </div>
        )}
      </div>
      {!!rewardsAccountBalance && (
        <button className="button secondary balance withdraw" onClick={withdrawRewards}>
          Withdraw
        </button>
      )}
    </div>

    <div className="total-balance-wrapper">
      <h2 className="card-title staking-balances-title">
        Staking balance
        <a
          className="wide-data-balloon"
          {...tooltip(
            "Staking Balance represents the funds that are on your staking addresses. Once you delegate to a pool, all these funds are staked. Stake delegation doesn't lock the funds and they are free to move. All funds that you receive to your addresses displayed on My Addresses tab on Send screen are automatically added to this balance (and therefore automatically staked). Also all staking rewards that are added to your Rewards Balance at the end of each epoch are included in your Staking Balance.",
            true
          )}
        >
          <span className="show-info">{''}</span>
        </a>
      </h2>
      <div className="balance-row">
        <div className="balance-amount-staking">
          {isNaN(Number(stakingBalance)) ? stakingBalance : `${printAda(stakingBalance)}`}
          <AdaIcon />
        </div>
      </div>

      {isShelleyCompatible && !!nonStakingBalance && (
        <Fragment>
          <h2 className="card-title staking-balances-title">
            Non-staking balance
            <a
              {...tooltip(
                'These are funds located on legacy or non-staking addresses and can be automatically transferred to your first staking address by clicking on the "Convert to stakeable" button. (minimum is 1.5 ADA)',
                true
              )}
            >
              <span className="show-info">{''}</span>
            </a>
          </h2>
          <div className="balance-row">
            <div className="balance-amount-staking">
              {isNaN(Number(nonStakingBalance))
                ? nonStakingBalance
                : `${printAda(nonStakingBalance)}`}
              <AdaIcon />
            </div>
            <button className="button secondary convert" onClick={convertNonStakingUtxos} />
          </div>
        </Fragment>
      )}
    </div>
  </div>
)

export default connect(
  (state: State) => ({
    stakingBalance: getActiveAccountInfo(state).shelleyBalances.stakingBalance,
    nonStakingBalance: getActiveAccountInfo(state).shelleyBalances.nonStakingBalance,
    rewardsAccountBalance: getActiveAccountInfo(state).shelleyBalances.rewardsAccountBalance,
    balance: getActiveAccountInfo(state).balance,
    isShelleyCompatible: state.isShelleyCompatible,
    nearestReward: getActiveAccountInfo(state).shelleyAccountInfo.rewardDetails.nearest,
  }),
  actions
)(shelleyBalances)
