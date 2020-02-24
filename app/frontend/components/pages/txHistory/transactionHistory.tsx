import {h, Component} from 'preact'
import printAda from '../../../helpers/printAda'
import formatDate from '../../../helpers/formatDate'
import {Lovelace} from '../../../state'
import {ADALITE_CONFIG} from '../../../config'
import actions from '../../../actions'
import {connect} from '../../../libs/unistore/preact'

const FormattedAmount = ({amount}: {amount: Lovelace}) => {
  const value = printAda(Math.abs(amount) as Lovelace)
  const number = `${value}`.indexOf('.') === -1 ? `${value}.0` : `${value}`
  return (
    <div className={`transaction-amount ${amount > 0 ? 'credit' : 'debit'}`}>
      {`${number}`.padEnd(10)}
    </div>
  )
}

const FormattedFee = ({fee}: {fee: Lovelace}) => {
  const value = printAda(fee)
  return <div className="transaction-fee">{`Fee: ${value}`}</div>
}

const Transaction = ({txid}) => (
  <div className="blockexplorer-link">
    <span>View on </span>
    {ADALITE_CONFIG.ADALITE_CARDANO_VERSION === 'byron' && (
      <span>
        <a
          className="transaction-address"
          href={`https://seiza.com/blockchain/transaction/${txid}`}
          target="_blank"
          rel="noopener"
        >
          Seiza
        </a>
        <span> | </span>
        <a
          className="transaction-address"
          href={`https://adascan.net/transaction/${txid}`}
          target="_blank"
          rel="noopener"
        >
          AdaScan
        </a>
      </span>
    )}
    {ADALITE_CONFIG.ADALITE_CARDANO_VERSION === 'shelley' && (
      <span>
        <a
          className="transaction-address"
          href={`https://shelleyexplorer.cardano.org/en/transaction/${txid}`}
          target="_blank"
          rel="noopener"
        >
          Shelley explorer
        </a>
      </span>
    )}
  </div>
)

interface Props {
  transactionHistory: any
}

class TransactionHistory extends Component<Props> {
  constructor(props) {
    super(props)
  }
  render({transactionHistory}) {
    return (
      <div className="transactions card">
        <h2 className="card-title">Transaction History</h2>
        {transactionHistory.length === 0 ? (
          <div className="transactions-empty">No transactions found</div>
        ) : (
          <ul className="transactions-content">
            {transactionHistory.map((transaction) => (
              <li key={transaction.ctbId} className="transaction-item">
                <div className="transaction-date">{formatDate(transaction.ctbTimeIssued)}</div>
                <FormattedAmount amount={transaction.effect} />
                <Transaction txid={transaction.ctbId} />
                <FormattedFee fee={transaction.fee} />
              </li>
            ))}
          </ul>
        )}
      </div>
    )
  }
}

// const TransactionHistory2 = ({transactionHistory}) => (
//   <div className="transactions card">
//     <h2 className="card-title">Transaction History</h2>
//     {transactionHistory.length === 0 ? (
//       <div className="transactions-empty">No transactions found</div>
//     ) : (
//       <ul className="transactions-content">
//         {transactionHistory.map((transaction) => (
//           <li key={transaction.ctbId} className="transaction-item">
//             <div className="transaction-date">{formatDate(transaction.ctbTimeIssued)}</div>
//             <FormattedAmount amount={transaction.effect} />
//             <Transaction txid={transaction.ctbId} />
//             <FormattedFee fee={transaction.fee} />
//           </li>
//         ))}
//       </ul>
//     )}
//   </div>
// )

// export default connect(
//   (state) => ({
//     transactionHistory: state.transactionHistory,
//   }),
//   actions
// )(TransactionHistory)

export default connect(
  (state) => ({
    transactionHistory: state.transactionHistory,
  }),
  actions
)(TransactionHistory)
