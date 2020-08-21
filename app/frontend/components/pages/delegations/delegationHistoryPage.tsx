import {h, Component, Fragment} from 'preact'
import actions from '../../../actions'
import {connect} from '../../../libs/unistore/preact'
import {CopyPoolId} from './common'

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
  const day = dateTime.getDate()
  const monthIndex = dateTime.getMonth()
  const year = dateTime.getFullYear()
  const minutes = dateTime.getMinutes()
  const hours = dateTime.getHours()
  const seconds = dateTime.getSeconds()
  return (
    <div className="grey margin-bottom">
      Epoch {epoch}, {monthIndex}/{day}/{year}, {hours}:{minutes}:{seconds}
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
    // example
    const delegationHistory1: DelegetionHistoryObject[] = [
      stakeDelegation1,
      stakeDelegation2,
      stakingReward1,
      rewardWithdrawal1,
    ].reverse()

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

// TODO: Delete
const stakeDelegation1 = {
  type: DelegetionHistoryItemType.StakeDelegation,
  epoch: 212,
  dateTime: new Date('2020-07-31T03:38:31.000Z'),
  newStakePool: {
    id: '0f292fcaa02b8b2f9b3c8f9fd8e0bb21abedb692a6d5058df3ef2735',
    name: 'StakeNuts',
  },
}

// TODO: Delete
const stakeDelegation2 = {
  type: DelegetionHistoryItemType.StakeDelegation,
  epoch: 212,
  dateTime: new Date('2020-07-31T03:38:31.000Z'),
  newStakePool: {
    id: 'ce19882fd62e79faa113fcaef93950a4f0a5913b20a0689911b6f62d',
    name: 'AdaLite Stake Pool 2',
  },
  oldStakePool: {
    id: '0f292fcaa02b8b2f9b3c8f9fd8e0bb21abedb692a6d5058df3ef2735',
    name: 'StakeNuts',
  },
}

// TODO: Delete
const stakingReward1 = {
  type: DelegetionHistoryItemType.StakingReward,
  epoch: 216,
  dateTime: new Date('2020-07-31T03:38:31.000Z'),
  reward: 21.931391,
  stakePool: {
    id: 'ce19882fd62e79faa113fcaef93950a4f0a5913b20a0689911b6f62d',
    name: 'AdaLite Stake Pool 2',
  },
}

// TODO: Delete
const rewardWithdrawal1: RewardWithdrawal = {
  type: DelegetionHistoryItemType.RewardWithdrawal,
  epoch: 216,
  dateTime: new Date('2020-07-31T03:38:31.000Z'),
  credit: 21.768808,
}
