import {h, Component, Fragment} from 'preact'
import actions from '../../../actions'
import {connect} from '../../../libs/unistore/preact'
import {CopyPoolId} from './common'

enum DelegetionHistoryItemType {
  StakeDelegation,
  StakingReward,
  RewardWithdrawal,
}

interface DelegetionHistoryObject {
  type: DelegetionHistoryItemType
}

interface StakePool {
  id: string
  name: string
}

interface StakeDelegation extends DelegetionHistoryObject {
  epoch: number
  date: string
  time: string
  newStakePool: StakePool
  oldStakePool?: StakePool
}

const StakeDelegationItem = ({stakeDelegation}: {stakeDelegation: StakeDelegation}) => {
  return (
    <li className="delegations-history-item">
      <div className="label">{stakeDelegation.newStakePool.name}</div>
      <div className="grey margin-bottom">
        Epoch {stakeDelegation.epoch}, {stakeDelegation.date}, {stakeDelegation.time}
      </div>
      <div>
        New pool: <span className="bold">StakeNuts</span>
        <CopyPoolId value={stakeDelegation.newStakePool.id} />
      </div>
      {stakeDelegation.oldStakePool ? (
        <div>
          Previous pool: StakeNuts
          <CopyPoolId value={stakeDelegation.oldStakePool.id} />
        </div>
      ) : (
        ''
      )}
    </li>
  )
}

interface StakingReward extends DelegetionHistoryObject {
  epoch: number
  date: string
  time: string
  reward: number
  stakePool: StakePool
}

const StakingRewardItem = ({stakingReward}: {stakingReward: StakingReward}) => {
  return (
    <li className="delegations-history-item">
      <div>
        <div className="label">Staking reward</div>
        <div className="grey margin-bottom">
          Epoch {stakingReward.epoch}, {stakingReward.date}, {stakingReward.time}
        </div>
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

interface RewardWithdrawal extends DelegetionHistoryObject {
  epoch: number
  date: string
  time: string
  credit: number
}

const RewardWithdrawalItem = ({rewardWithdrawal}: {rewardWithdrawal: RewardWithdrawal}) => {
  return (
    <li className="delegations-history-item">
      <div className="space-between">
        <div>
          <div className="label">Reward withdrawal</div>
          <div className="grey margin-bottom">
            Epoch {rewardWithdrawal.epoch}, {rewardWithdrawal.date}, {rewardWithdrawal.time}
          </div>
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

const DTOToItem = {
  [DelegetionHistoryItemType.StakeDelegation]: (dto: DelegetionHistoryObject) => (
    <StakeDelegationItem stakeDelegation={dto as StakeDelegation} />
  ),
  [DelegetionHistoryItemType.StakingReward]: (dto: DelegetionHistoryObject) => (
    <StakingRewardItem stakingReward={dto as StakingReward} />
  ),
  [DelegetionHistoryItemType.RewardWithdrawal]: (dto: DelegetionHistoryObject) => (
    <RewardWithdrawalItem rewardWithdrawal={dto as RewardWithdrawal} />
  ),
}

class DelegationHistoryPage extends Component<Props> {
  render({delegationHistory}) {
    const delegationHistory1: DelegetionHistoryObject[] = [
      stakeDelegation1,
      stakeDelegation2,
      stakingReward1,
      rewardWithdrawal1,
    ].reverse()

    const items = delegationHistory1.map((data: DelegetionHistoryObject) => {
      try {
        return DTOToItem[data.type](data)
      } catch (e) {
        return ''
      }
    })

    return (
      <div className="delegations-history card">
        <h2 className="card-title">Staking History</h2>
        {delegationHistory1.length === 0 ? (
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
  date: '08/19/2020',
  time: '13:43:51',
  newStakePool: {
    id: '0f292fcaa02b8b2f9b3c8f9fd8e0bb21abedb692a6d5058df3ef2735',
    name: 'StakeNuts',
  },
}

// TODO: Delete
const stakeDelegation2 = {
  type: DelegetionHistoryItemType.StakeDelegation,
  epoch: 212,
  date: '08/20/2020',
  time: '07:36:48',
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
  date: '08/20/2020',
  time: '07:36:48',
  reward: 21.931391,
  stakePool: {
    id: 'ce19882fd62e79faa113fcaef93950a4f0a5913b20a0689911b6f62d',
    name: 'AdaLite Stake Pool 2',
  },
}

// TODO: Delete
const rewardWithdrawal1 = {
  type: DelegetionHistoryItemType.RewardWithdrawal,
  epoch: 216,
  date: '09/08/2020',
  time: '14:31:24',
  credit: 21.768808,
}
