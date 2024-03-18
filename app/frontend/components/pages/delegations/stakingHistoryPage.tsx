import {h} from 'preact'
import actions from '../../../actions'
import {connect} from '../../../libs/unistore/preact'
import {LinkIconToPool} from './common'
import printAda from '../../../helpers/printAda'
import {getCexplorerUrl} from '../../../helpers/common'
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
import {useActiveAccount} from '../../../selectors'
import {useState} from 'preact/hooks'

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
      <ViewOnCexplorer
        txHash={stakeDelegation.txHash}
        suffix="/delegation"
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
      <ViewOnCexplorer txHash={rewardWithdrawal.txHash} suffix="/withdrawal" />
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
      <ViewOnCexplorer txHash={stakingKeyRegistration.txHash} className="margin-top" />
    </li>
  )
}

const ViewOnCexplorer = ({txHash, suffix = '', className = ''}) => {
  return (
    <div className={`blockexplorer-link ${className}`}>
      <span>View on </span>
      <span>
        <a
          className="transaction-address"
          href={`${getCexplorerUrl()}/tx/${txHash}${suffix}`}
          target="_blank"
          rel="noopener"
        >
          Cexplorer
        </a>
      </span>
    </div>
  )
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

const DEFAULT_STAKING_HISTORY_LIMIT = 50

const StakingHistoryPage = (): h.JSX.Element => {
  const {stakingHistory} = useActiveAccount()
  const [showAll, setShowAll] = useState(false)

  const items = (
    showAll ? stakingHistory : stakingHistory.slice(0, DEFAULT_STAKING_HISTORY_LIMIT)
  ).map((data: StakingHistoryObject) => {
    try {
      return StakingHistoryObjectToItem[data.type](data)
    } catch (e) {
      return ''
    }
  })

  return (
    <div className="staking-history card">
      <h2 className="card-title">Staking and Rewards History</h2>
      {stakingHistory.length === 0 ? (
        <div className="transactions-empty">No history found</div>
      ) : (
        <ul className="staking-history-content">
          {items}
          {stakingHistory.length > DEFAULT_STAKING_HISTORY_LIMIT && !showAll && (
            <a className="show-all" onClick={() => setShowAll(true)}>
              show all
            </a>
          )}
        </ul>
      )}
    </div>
  )
}

export default connect(null, actions)(StakingHistoryPage)
