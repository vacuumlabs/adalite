import {h, Component, Fragment} from 'preact'
import actions from '../../../actions'
import {connect} from '../../../libs/unistore/preact'
import {CopyPoolId} from './common'
import toLocalDate from '../../../helpers/toLocalDate'
import {Lovelace} from '../../../state'
import printAda from '../../../helpers/printAda'
import CopyOnClick from '../../common/copyOnClick'

export enum StakingHistoryItemType {
  StakeDelegation,
  StakingReward,
  RewardWithdrawal,
  StakingKeyRegistration,
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
  txid: string
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
      <div className="label">Stake delegation</div>
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
      <ViewOnCardanoScan
        txid={stakeDelegation.txid}
        suffix="?tab=delegations"
        className="margin-top"
      />
    </li>
  )
}

export interface StakingReward extends StakingHistoryObject {
  reward: Lovelace
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
        <div>Reward: {printAda(stakingReward.reward)}</div>
        <div className="grey">
          {stakingReward.stakePool.name}
          <CopyPoolId value={stakingReward.stakePool.id} />
        </div>
      </div>
    </li>
  )
}

export interface RewardWithdrawal extends StakingHistoryObject {
  credit: Lovelace
  txid: string
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
          <div className="transaction-amount credit">{printAda(rewardWithdrawal.credit)}</div>
        </div>
      </div>
      <ViewOnCardanoScan txid={rewardWithdrawal.txid} suffix="?tab=withdrawals" />
    </li>
  )
}

export interface StakingKeyRegistration extends StakingHistoryObject {
  action: string
  stakingKey: string
  txid: string
}

const formatStakingKey = (str: string, n: number) =>
  `${str.substring(0, n)}...${str.substring(str.length - n)}`

const StakingKeyRegistrationItem = ({
  stakingKeyRegistration,
}: {
stakingKeyRegistration: StakingKeyRegistration
}) => {
  return (
    <li className="delegations-history-item">
      <div className="label">Staking key {stakingKeyRegistration.action}</div>
      <EpochDateTime
        epoch={stakingKeyRegistration.epoch}
        dateTime={stakingKeyRegistration.dateTime}
      />
      <div>
        Staking key: {formatStakingKey(stakingKeyRegistration.stakingKey, 8)}
        <CopyOnClick
          value={stakingKeyRegistration.stakingKey}
          elementClass="address-link copy"
          tooltipMessage="Staking key copied to clipboard"
        >
          <a className="copy-text ml-8" />
        </CopyOnClick>
      </div>
      <ViewOnCardanoScan
        txid={stakingKeyRegistration.txid}
        suffix="?tab=stakecertificates"
        className="margin-top"
      />
    </li>
  )
}

const ViewOnCardanoScan = ({txid, suffix, className = ''}) => {
  return (
    <div className={`blockexplorer-link ${className}`}>
      <span>View on </span>
      <span>
        <a
          className="transaction-address"
          href={`https://cardanoscan.io/transaction/${txid}${suffix}`}
          target="_blank"
          rel="noopener"
        >
          Cardanoscan
        </a>
      </span>
    </div>
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
  [StakingHistoryItemType.StakingKeyRegistration]: (x: StakingHistoryObject) => (
    <StakingKeyRegistrationItem stakingKeyRegistration={x as StakingKeyRegistration} />
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
