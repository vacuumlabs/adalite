import {h, Component, Fragment} from 'preact'
import actions from '../../../actions'
import {connect} from '../../../libs/unistore/preact'
import {CopyPoolId} from './common'

const Delegation1 = () => {
  return (
    <li className="delegations-history-item">
      <div className="space-between">
        <div>
          <div className="label">Stake delegation</div>
          <div className="grey margin-bottom">Epoch 212, 08/19/2020, 13:43:51</div>
        </div>
        {/* <div>
          <div className="transaction-amount debit">2.162583</div>
          <div className="right">Fee: 0.162583</div>
          <div className="right">Key Registration: 2.000000</div>
        </div> */}
      </div>
      <div>
        <div>
          New pool: <span className="bold">StakeNuts</span>
          <CopyPoolId value={'0f292fcaa02b8b2f9b3c8f9fd8e0bb21abedb692a6d5058df3ef2735'} />
        </div>
        {/* <div className="grey margin-bottom">0f292fcaa02b8b2f9b3c8f9fd8e0bb21abedb692a6d5058df3ef2735</div> */}
      </div>
    </li>
  )
}

const Delegation2 = () => {
  return (
    <li className="delegations-history-item">
      <div className="space-between">
        <div>
          <div className="label">Stake delegation</div>
          <div className="grey margin-bottom">Epoch 212, 08/20/2020, 07:36:48</div>
        </div>
        {/* <div>
          <div className="transaction-amount debit">0.171628</div>
          <div>Fee: 0.171628</div>
        </div> */}
      </div>
      <div>
        <div>
          New pool: <span className="bold">AdaLite Stake Pool 2</span>
          <CopyPoolId value={'ce19882fd62e79faa113fcaef93950a4f0a5913b20a0689911b6f62d'} />
        </div>
        <div>
          Previous pool: StakeNuts
          <CopyPoolId value={'0f292fcaa02b8b2f9b3c8f9fd8e0bb21abedb692a6d5058df3ef2735'} />
        </div>
      </div>
    </li>
  )
}

const StakingReward = () => {
  return (
    <li className="delegations-history-item">
      <div>
        <div className="label">Staking reward</div>
        <div className="grey margin-bottom">Epoch 216, 09/07/2020, 21:40:58</div>
      </div>
      <div>
        <div>Reward: 21.931391</div>
        <div className="grey">
          AdaLite Stake Pool 2
          <CopyPoolId value={'0f292fcaa02b8b2f9b3c8f9fd8e0bb21abedb692a6d5058df3ef2735'} />
        </div>
      </div>
    </li>
  )
}

const RewardWithdrawal = () => {
  return (
    <li className="delegations-history-item">
      <div className="space-between">
        <div>
          <div className="label">Reward withdrawal</div>
          <div className="grey margin-bottom">Epoch 216, 09/08/2020, 14:31:24</div>
        </div>
        <div>
          <div className="transaction-amount credit">21.768808</div>
        </div>
      </div>
    </li>
  )
}

interface Props {
  delegationHistory: any
}

class DelegationHistoryPage extends Component<Props> {
  render({delegationHistory}) {
    return (
      <div className="delegations-history card">
        <h2 className="card-title">Staking History</h2>
        {/* <div className="transactions-empty">No history found</div> */}
        <ul className="delegations-history-content">
          <RewardWithdrawal />
          <StakingReward />
          {/* <Delegation1 /> */}
          <Delegation2 />
          <Delegation1 />
        </ul>
        {/* {delegationHistory.length === 0 ? (
          <div className="transactions-empty">No transactions found</div>
        ) : (
          <ul className="transactions-content">
            {delegationHistory.map((delegation) => (
              <li key={delegation.ctbId} className="transaction-item">
                <div className="transaction-date">{formatDate(delegation.ctbTimeIssued)}</div>
                <FormattedAmount amount={delegation.effect} />
                <Transaction txid={delegation.ctbId} />
                <FormattedFee fee={delegation.fee} />
              </li>
            ))}
          </ul>
        )} */}
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
