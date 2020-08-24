import {h, Component, Fragment} from 'preact'
import actions from '../../../actions'
import {connect} from '../../../libs/unistore/preact'
import {CopyPoolId} from './common'
import toLocalDate from '../../../../frontend/helpers/toLocalDate'

export enum DelegetionHistoryItemType {
  StakeDelegation,
  StakingReward,
  RewardWithdrawal,
}

export interface DelegetionHistoryObject {
  type: DelegetionHistoryItemType
  epoch: number
  dateTime: Date
}

export interface StakePool {
  id: string
  name: string
}

export interface StakeDelegation extends DelegetionHistoryObject {
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

export interface StakingReward extends DelegetionHistoryObject {
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

export interface RewardWithdrawal extends DelegetionHistoryObject {
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
  delegationHistory: any
}

const DelegationHistoryObjectToItem = {
  [DelegetionHistoryItemType.StakeDelegation]: (x: DelegetionHistoryObject) => (
    <StakeDelegationItem stakeDelegation={x as StakeDelegation} />
  ),
  [DelegetionHistoryItemType.StakingReward]: (x: DelegetionHistoryObject) => (
    <StakingRewardItem stakingReward={x as StakingReward} />
  ),
  [DelegetionHistoryItemType.RewardWithdrawal]: (x: DelegetionHistoryObject) => (
    <RewardWithdrawalItem rewardWithdrawal={x as RewardWithdrawal} />
  ),
}

class DelegationHistoryPage extends Component<Props> {
  render({delegationHistory}) {
    const items = delegationHistory.map((data: DelegetionHistoryObject) => {
      try {
        return DelegationHistoryObjectToItem[data.type](data)
      } catch (e) {
        return ''
      }
    })

    return (
      <div className="delegations-history card">
        <h2 className="card-title">Staking History</h2>
        {delegationHistory.length === 0 ? (
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
    delegationHistory: state.delegationHistory,
  }),
  actions
)(DelegationHistoryPage)
