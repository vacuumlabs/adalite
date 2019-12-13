import {h} from 'preact'
import printAda from '../../../helpers/printAda'
import formatDate from '../../../helpers/formatDate'

const FormattedAmount = ({amount}) => {
  const value = printAda(Math.abs(amount))
  const number = `${value}`.indexOf('.') === -1 ? `${value}.0` : `${value}`
  return (
    <div className={`transaction-amount ${amount > 0 ? 'credit' : 'debit'}`}>
      {`${number}`.padEnd(10)}
    </div>
  )
}

const FormattedFee = ({fee}) => {
  const value = printAda(fee)
  return <div className="transaction-fee">{`Fee: ${value}`}</div>
}

const TransactionAddress = ({address}) => (
  <div className="blockexplorer-link">
    <span>View on </span>
    <a
      className="transaction-address"
      href={`https://seiza.com/blockchain/transaction/${address}`}
      target="_blank"
      rel="noopener"
    >
      Seiza
    </a>
    <span> | </span>
    <a
      className="transaction-address"
      href={`https://adascan.net/transaction/${address}`}
      target="_blank"
      rel="noopener"
    >
      AdaScan
    </a>
  </div>
)

const TransactionHistory = ({transactionHistory}) => (
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
            <TransactionAddress address={transaction.ctbId} />
            <FormattedFee fee={transaction.fee} />
          </li>
        ))}
      </ul>
    )}
  </div>
)

export default TransactionHistory
