import {h, Component, Fragment} from 'preact'
import actions from '../../../actions'
import {connect} from '../../../libs/unistore/preact'

// const DelegationHistory = ({delegationHistory}) => {
//   return (
//     <div className="delegation-history card">
//       <h2 className="card-title">Delegation history</h2>
//       {delegationHistory.length === 0 ? (
//         <div className="delegation-history-empty">No delegations found</div>
//       ) : (
//         <ul className="delegation-history-content">
//           {delegationHistory.map((entry, i) => (
//             <li key={i} className="delegation-history-item">
//               <div className="delegation-history-time">{entry.timeIssued}</div>
//               <div className={`delegation-history-title ${entry.entryType}`}>{entry.entryType}</div>
//               {entry.entryType === 'delegation' ? (
//                 entry.stakePools.map((pool, i) => [
//                   <div key={i} className="delegation-history-name">
//                     {pool.name}
//                   </div>,
//                   <div key={i} className="delegation-history-percent">{`${pool.ratio} %`}</div>,
//                   <div key={i} className="delegation-history-id">
//                     {pool.id}
//                   </div>,
//                   <div key={i} />,
//                 ])
//               ) : entry.entryType === 'reward' ? (
//                 [
//                   <div key={i} className="delegation-history-reward-info">
//                     {entry.info}
//                   </div>,
//                   <div key={i} className="delegation-history-amount">
//                     {printAda(entry.amount)}
//                   </div>,
//                 ]
//               ) : (
//                 <div />
//               )}
//             </li>
//           ))}
//         </ul>
//       )}
//     </div>
//   )
// }

const Delegation1 = () => {
  return (
    <li className="delegations-history-item">
      <div className="space-between">
        <div>
          <div className="label">Stake delegation</div>
          <div className="grey margin-bottom">Epoch 212, 08/19/2020, 13:43:51</div>
        </div>
        <div>
          <div className="transaction-amount debit">2.162583</div>
          <div className="right">Fee: 0.162583</div>
          <div className="right">Key Registration: 2.000000</div>
        </div>
      </div>
      <div>
        <div>
          New pool: <span className="bold">StakeNuts</span>
        </div>
        <div className="grey margin-bottom">
          0f292fcaa02b8b2f9b3c8f9fd8e0bb21abedb692a6d5058df3ef2735
        </div>
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
        <div>
          <div className="transaction-amount debit">0.171628</div>
          <div>Fee: 0.171628</div>
        </div>
      </div>
      <div>
        <div>
          New pool: <span className="bold">AdaLite Stake Pool 2</span>
        </div>
        <div className="grey margin-bottom">
          ce19882fd62e79faa113fcaef93950a4f0a5913b20a0689911b6f62d
        </div>
        <div>Previous pool: StakeNuts</div>
        <div className="grey">0f292fcaa02b8b2f9b3c8f9fd8e0bb21abedb692a6d5058df3ef2735</div>
      </div>
    </li>
  )
}

const PoolRewards = () => {
  return (
    <li className="delegations-history-item">
      <div>
        <div className="label">Pool reward</div>
        <div className="grey margin-bottom">Epoch 216, 09/07/2020, 21:40:58</div>
      </div>
      <div>
        <div>Reward: 21.931391</div>
        <div className="grey">AdaLite Stake Pool 2</div>
        <div className="grey margin-bottom">
          0f292fcaa02b8b2f9b3c8f9fd8e0bb21abedb692a6d5058df3ef2735
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
          <div>Fee: 0.162583</div>
        </div>
      </div>
    </li>
  )
}

interface Props {
  delegationHistory: any
}

class DelegationHistory extends Component<Props> {
  render({delegationHistory}) {
    return (
      <div className="delegations-history card">
        <h2 className="card-title">Staking History</h2>
        {/* <div className="transactions-empty">No history found</div> */}
        <ul className="delegations-history-content">
          <RewardWithdrawal />
          <PoolRewards />
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
)(DelegationHistory)
