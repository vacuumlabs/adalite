import {h, Component, Fragment} from 'preact'
import actions from '../../../actions'
import {connect} from '../../../libs/unistore/preact'
import {CopyPoolId} from './common'
import toLocalDate from '../../../helpers/toLocalDate'

export enum StakingHistoryItemType {
  StakeDelegation,
  StakingReward,
  RewardWithdrawal,
}

export interface StakingHistoryObject {
  type: StakingHistoryItemType
  epoch: number
  dateTime: Date
}

export interface StakePool {
  id: string
  name: string
}

export interface StakeDelegation extends StakingHistoryObject {
  newStakePool: StakePool
  oldStakePool?: StakePool
}

const EpochDateTime = ({epoch, dateTime}: {epoch: number; dateTime: Date}) => {
  return (
    <div className="grey margin-bottom">
      Epoch {epoch}, {toLocalDate(dateTime)}
    </div>
  )
}

const StakeDelegationItem = ({stakeDelegation}: {stakeDelegation: StakeDelegation}) => {
  return (
    <li className="delegations-history-item">
      <div className="label">Stake Delegation</div>
      <EpochDateTime epoch={stakeDelegation.epoch} dateTime={stakeDelegation.dateTime} />
      <div>
        New pool: <span className="bold">{stakeDelegation.newStakePool.name}</span>
        <CopyPoolId value={stakeDelegation.newStakePool.id} />
      </div>
      {stakeDelegation.oldStakePool ? (
        <div>
          Previous pool: {stakeDelegation.oldStakePool.name}
          <CopyPoolId value={stakeDelegation.oldStakePool.id} />
        </div>
      ) : (
        ''
      )}
    </li>
  )
}

export interface StakingReward extends StakingHistoryObject {
  reward: number
  stakePool: StakePool
}

const StakingRewardItem = ({stakingReward}: {stakingReward: StakingReward}) => {
  return (
    <li className="delegations-history-item">
      <div>
        <div className="label">Staking reward</div>
        <EpochDateTime epoch={stakingReward.epoch} dateTime={stakingReward.dateTime} />
      </div>
      <div>
        <div>Reward: {stakingReward.reward}</div>
        <div className="grey">
          {stakingReward.stakePool.name}
          <CopyPoolId value={stakingReward.stakePool.id} />
        </div>
      </div>
    </li>
  )
}

export interface RewardWithdrawal extends StakingHistoryObject {
  credit: number
}

const RewardWithdrawalItem = ({rewardWithdrawal}: {rewardWithdrawal: RewardWithdrawal}) => {
  return (
    <li className="delegations-history-item">
      <div className="space-between">
        <div>
          <div className="label">Reward withdrawal</div>
          <EpochDateTime epoch={rewardWithdrawal.epoch} dateTime={rewardWithdrawal.dateTime} />
        </div>
        <div>
          <div className="transaction-amount credit">{rewardWithdrawal.credit}</div>
        </div>
      </div>
    </li>
  )
}

interface Props {
  stakingHistory: any
}

const StakingHistoryObjectToItem = {
  [StakingHistoryItemType.StakeDelegation]: (x: StakingHistoryObject) => (
    <StakeDelegationItem stakeDelegation={x as StakeDelegation} />
  ),
  [StakingHistoryItemType.StakingReward]: (x: StakingHistoryObject) => (
    <StakingRewardItem stakingReward={x as StakingReward} />
  ),
  [StakingHistoryItemType.RewardWithdrawal]: (x: StakingHistoryObject) => (
    <RewardWithdrawalItem rewardWithdrawal={x as RewardWithdrawal} />
  ),
}

class StakingHistoryPage extends Component<Props> {
  render({stakingHistory}) {
    const items = stakingHistory.map((data: StakingHistoryObject) => {
      try {
        return StakingHistoryObjectToItem[data.type](data)
      } catch (e) {
        return ''
      }
    })

    return (
      <div className="delegations-history card">
        <h2 className="card-title">Staking History</h2>
        {stakingHistory.length === 0 ? (
          <div className="transactions-empty">No history found</div>
        ) : (
          <ul className="delegations-history-content">{items}</ul>
        )}
      </div>
    )
  }
}

export default connect(
  (state) => ({
    stakingHistory: state.stakingHistory,
  }),
  actions
)(StakingHistoryPage)
