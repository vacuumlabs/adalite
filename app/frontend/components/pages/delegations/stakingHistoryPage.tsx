import {h, Component} from 'preact'
import actions from '../../../actions'
import {connect} from '../../../libs/unistore/preact'
import {LinkIconToPool} from './common'
import {getActiveAccountInfo, State} from '../../../state'
import printAda from '../../../helpers/printAda'
import CopyOnClick from '../../common/copyOnClick'
import {EpochDateTime} from '../common'
import {RewardType} from '../../../wallet/backend-types'
import {
  StakingHistoryItemType,
  StakingHistoryObject,
  StakeDelegation,
  StakingReward,
  RewardWithdrawal,
  StakingKeyRegistration,
} from '../../../types'
import Alert from '../../common/alert'

const StakeDelegationItem = ({stakeDelegation}: {stakeDelegation: StakeDelegation}) => {
  return (
    <li className="staking-history-item">
      <div className="label">Stake delegation</div>
      <div className="margin-bottom">
        <EpochDateTime epoch={stakeDelegation.epoch} dateTime={stakeDelegation.dateTime} />
      </div>
      <div>
        New pool: <span className="bold">{stakeDelegation.newStakePool.name}</span>
        <LinkIconToPool poolHash={stakeDelegation.newStakePool.id} />
      </div>
      {stakeDelegation.oldStakePool ? (
        <div>
          Previous pool: {stakeDelegation.oldStakePool.name}
          <LinkIconToPool poolHash={stakeDelegation.oldStakePool.id} />
        </div>
      ) : (
        ''
      )}
      <ViewOnCardanoScan
        txHash={stakeDelegation.txHash}
        suffix="?tab=delegations"
        className="margin-top"
      />
    </li>
  )
}

const StakingRewardItem = ({stakingReward}: {stakingReward: StakingReward}) => {
  return (
    <li className="staking-history-item">
      <div className="space-between">
        <div>
          <div>
            {/* TODO: Remake into exhaustive switch */}
            {stakingReward.rewardType === RewardType.REGULAR && (
              <div className="label">Reward for epoch {stakingReward.forEpoch}</div>
            )}
            {stakingReward.rewardType === RewardType.ITN && (
              <div className="label">Reward for ITN</div>
            )}
            {stakingReward.rewardType === RewardType.TREASURY && (
              <div className="label">Reward for Catalyst</div>
            )}
            <div className="margin-bottom">
              <EpochDateTime epoch={stakingReward.epoch} dateTime={stakingReward.dateTime} />
            </div>
          </div>
          <div>
            <div className="grey">
              {stakingReward.rewardType === RewardType.REGULAR && stakingReward.stakePool.name}
              {stakingReward.stakePool.id && (
                <LinkIconToPool poolHash={stakingReward.stakePool.id} />
              )}
            </div>
          </div>
        </div>
        <div>
          <div className="transaction-amount credit">{printAda(stakingReward.reward)}</div>
        </div>
      </div>
    </li>
  )
}

const RewardWithdrawalItem = ({rewardWithdrawal}: {rewardWithdrawal: RewardWithdrawal}) => {
  return (
    <li className="staking-history-item">
      <div className="space-between">
        <div>
          <div className="label">Reward withdrawal</div>
          <div className="margin-bottom">
            <EpochDateTime epoch={rewardWithdrawal.epoch} dateTime={rewardWithdrawal.dateTime} />
          </div>
        </div>
        <div>
          <div className="transaction-amount withdraw">{printAda(rewardWithdrawal.amount)}</div>
        </div>
      </div>
      <ViewOnCardanoScan txHash={rewardWithdrawal.txHash} suffix="?tab=withdrawals" />
    </li>
  )
}

const formatStakingKey = (str: string, n: number) =>
  `${str.substring(0, n)}...${str.substring(str.length - n)}`

/* eslint-disable-next-line @typescript-eslint/no-unused-vars */
const StakingKeyRegistrationItem = ({
  stakingKeyRegistration,
}: {
  stakingKeyRegistration: StakingKeyRegistration
}) => {
  return (
    <li className="staking-history-item">
      <div className="label">Staking key {stakingKeyRegistration.action}</div>
      <div className="margin-bottom">
        <EpochDateTime
          epoch={stakingKeyRegistration.epoch}
          dateTime={stakingKeyRegistration.dateTime}
        />
      </div>
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
        txHash={stakingKeyRegistration.txHash}
        suffix="?tab=stakecertificates"
        className="margin-top"
      />
    </li>
  )
}

const ViewOnCardanoScan = ({txHash, suffix, className = ''}) => {
  return (
    <div className={`blockexplorer-link ${className}`}>
      <span>View on </span>
      <span>
        <a
          className="transaction-address"
          href={`https://cardanoscan.io/transaction/${txHash}${suffix}`}
          target="_blank"
          rel="noopener"
        >
          CardanoScan
        </a>
      </span>
    </div>
  )
}

interface Props {
  stakingHistory: any
}

const StakingHistoryObjectToItem = {
  [StakingHistoryItemType.STAKE_DELEGATION]: (x: StakingHistoryObject) => (
    <StakeDelegationItem stakeDelegation={x as StakeDelegation} />
  ),
  [StakingHistoryItemType.STAKING_REWARD]: (x: StakingHistoryObject) => (
    <StakingRewardItem stakingReward={x as StakingReward} />
  ),
  [StakingHistoryItemType.REWARD_WITHDRAWAL]: (x: StakingHistoryObject) => (
    <RewardWithdrawalItem rewardWithdrawal={x as RewardWithdrawal} />
  ),
  [StakingHistoryItemType.STAKING_KEY_DEREGISTRATION]: (x: StakingHistoryObject) => (
    <StakingKeyRegistrationItem stakingKeyRegistration={x as StakingKeyRegistration} />
  ),
  [StakingHistoryItemType.STAKING_KEY_REGISTRATION]: (x: StakingHistoryObject) => (
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
      <div className="staking-history card">
        <h2 className="card-title">Staking and Rewards History</h2>
        <div className="staking-history-warning">
          <Alert alertType="warning">Some rewards may be missing in the history.</Alert>
        </div>
        {stakingHistory.length === 0 ? (
          <div className="transactions-empty">No history found</div>
        ) : (
          <ul className="staking-history-content">{items}</ul>
        )}
      </div>
    )
  }
}

export default connect(
  (state: State) => ({
    stakingHistory: getActiveAccountInfo(state).stakingHistory,
  }),
  actions
)(StakingHistoryPage)
