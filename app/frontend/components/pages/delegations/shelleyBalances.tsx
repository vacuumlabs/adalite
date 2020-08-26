import {h} from 'preact'
import printAda from '../../../helpers/printAda'
import {AdaIcon} from '../../common/svg'
import actions from '../../../actions'
import {connect} from '../../../libs/unistore/preact'
import tooltip from '../../common/tooltip'

const shelleyBalances = ({
  stakingBalance,
  nonStakingBalance,
  rewardsAccountBalance,
  balance,
  reloadWalletInfo,
  convertNonStakingUtxos,
  redeemRewards,
  calculatingDelegationFee,
  hwWalletName,
  isShelleyCompatible,
}) => (
  <div className="rewards card">
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
    <div className="staking-balances-row">
      <div className="staking-balances-amount">
        {isNaN(Number(stakingBalance)) ? stakingBalance : `${printAda(stakingBalance)}`}
        <AdaIcon />
      </div>
    </div>
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
    <div className="staking-balances-row">
      <div className="staking-balances-amount">
        {isNaN(Number(nonStakingBalance)) ? nonStakingBalance : `${printAda(nonStakingBalance)}`}
        <AdaIcon />
      </div>
      {isShelleyCompatible &&
        !!nonStakingBalance && (
        <button
          disabled={calculatingDelegationFee}
          className="button stake-pool"
          onClick={convertNonStakingUtxos}
        >
            Convert to stakable
        </button>
      )}
    </div>
    <h2 className="card-title staking-balances-title">
      Rewards account balance
      <a
        className="wide-data-balloon"
        {...tooltip(
          'This value represents balance on your rewards account. It contains all rewards received from delegation that were not transferred yet to your Available balance. This rewards are automatically staked. You need to Withdraw Rewards only when you want to spend them. Withdraw Rewards button will appear only once you have some rewards in your Rewards Balance.',
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
      </div>
      {!!rewardsAccountBalance && (
        <button
          disabled={calculatingDelegationFee}
          className="button stake-pool"
          onClick={redeemRewards}
        >
          Withdraw Rewards
        </button>
      )}
    </div>
    <div className="total-balance-wrapper">
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
      <div className="balance-row">
        <div className="balance-amount-staking">
          {isNaN(Number(balance)) ? balance : `${printAda(balance)}`}
          <AdaIcon />
        </div>
        <button className="button refresh" onClick={reloadWalletInfo}>
          Refresh
        </button>
      </div>
    </div>
  </div>
)

export default connect(
  (state) => ({
    stakingBalance: state.shelleyBalances.stakingBalance,
    nonStakingBalance: state.shelleyBalances.nonStakingBalance,
    rewardsAccountBalance: state.shelleyBalances.rewardsAccountBalance,
    balance: state.balance,
    calculatingDelegationFee: state.calculatingDelegationFee,
    hwWalletName: state.hwWalletName,
    isShelleyCompatible: state.isShelleyCompatible,
  }),
  actions
)(shelleyBalances)
