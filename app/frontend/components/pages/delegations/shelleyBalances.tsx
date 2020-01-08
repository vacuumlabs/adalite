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
}) => (
  <div className="rewards card">
    <h2 className="card-title staking-balances-title">
      Staking balance
      <a
        {...tooltip(
          'Staking balance represents amount of coins you are able to delegate to a pool.',
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
    <label className="card-title staking-balances-title">
      Non-staking balance
      <a
        {...tooltip(
          'Non-staking balance represent amount of coins you re NOT able to delegate to any pool.',
          true
        )}
      >
        <span className="show-info">{''}</span>
      </a>
    </label>
    <div className="staking-balances-row">
      <div className="staking-balances-amount">
        {isNaN(Number(nonStakingBalance)) ? nonStakingBalance : `${printAda(nonStakingBalance)}`}
        <AdaIcon />
      </div>
      {nonStakingBalance && (
        <button className="button stake-pool" onClick={convertNonStakingUtxos}>
          Convert to stakable
        </button>
      )}
    </div>
    <label className="card-title staking-balances-title">
      Rewards account balance
      <a
        {...tooltip(
          'This value represents balance on your staking account. It contains all recieved rewards from staking or recieved ADA',
          true
        )}
      >
        <span className="show-info">{''}</span>
      </a>
    </label>
    <div className="staking-balances-row">
      <div className="staking-balances-amount">
        {isNaN(Number(rewardsAccountBalance))
          ? rewardsAccountBalance
          : `${printAda(rewardsAccountBalance)}`}
        <AdaIcon />
      </div>
      {/* <button className="button stake-pool" onClick={null}>
        Redeem
      </button> */}
    </div>
    <div className="total-balance-wrapper">
      <h2 className="card-title staking-balances-title">Balance</h2>
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
  }),
  actions
)(shelleyBalances)
