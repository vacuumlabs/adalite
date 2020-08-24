import {h, Component} from 'preact'
import printAda from '../../../helpers/printAda'
import formatDate from '../../../helpers/formatDate'
import {Lovelace} from '../../../state'
import {ADALITE_CONFIG} from '../../../config'
import actions from '../../../actions'
import {connect} from '../../../libs/unistore/preact'
import moment = require('moment')

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
          href={`https://explorer.cardano.org/en/transaction/?id=${txid}`}
          target="_blank"
          rel="noopener"
        >
          CardanoExplorer
        </a>
      </span>
    )}
    {ADALITE_CONFIG.ADALITE_CARDANO_VERSION === 'shelley' && (
      <span>
        <a
          className="transaction-address"
          href={`https://explorer.cardano.org/en/transaction?id=${txid}`}
          target="_blank"
          rel="noopener"
        >
          ShelleyExplorer
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
  </div>
)

interface Props {
  transactionHistory: any
}

const ExportCSV = ({transactionHistory}) => {
  const formatTransactionDate = (ctbTimeIssued) =>
    moment.utc(new Date(ctbTimeIssued * 1000)).format('MM/DD/YYYY hh:mm A [UTC]')

  const delimiter = ','
  const rowsDelimiter = '\n'

  const headers =
    `Type${delimiter}` +
    `Received amount${delimiter}` +
    `Received currency${delimiter}` +
    `Sent amount${delimiter}` +
    `Sent currency${delimiter}` +
    `Fee amount${delimiter}` +
    `Fee currency${delimiter}` +
    `Transaction ID${delimiter}` +
    `Date${delimiter}`

  const rows = transactionHistory.map((transaction) => {
    if (transaction.effect > 0) {
      return (
        `${'Received'}${delimiter}` +
        `${printAda(transaction.effect as Lovelace)}${delimiter}` +
        `ADA${delimiter}` +
        `${delimiter}` +
        `${delimiter}` +
        `${delimiter}` +
        `${delimiter}` +
        `${transaction.ctbId}${delimiter}` +
        `${formatTransactionDate(transaction.ctbTimeIssued)}${delimiter}`
      )
    } else {
      return (
        `${'Sent'}${delimiter}` +
        `${delimiter}` +
        `${delimiter}` +
        `${printAda((Math.abs(transaction.effect) - transaction.fee) as Lovelace)}${delimiter}` +
        `ADA${delimiter}` +
        `${printAda(transaction.fee as Lovelace)}${delimiter}` +
        `ADA${delimiter}` +
        `${transaction.ctbId}${delimiter}` +
        `${formatTransactionDate(transaction.ctbTimeIssued)}${delimiter}`
      )
    }
  })

  const fileContents = `${headers}${rowsDelimiter}${rows.join(rowsDelimiter)}`
  const filename = 'transactions.csv'
  const filetype = 'text/plain'

  const dataURI = `data:${filetype};base64,${btoa(fileContents)}`

  return (
    <a href={dataURI} download={filename} className="download-transactions-text">
      Export to CSV
    </a>
  )
}

class TransactionHistory extends Component<Props> {
  render({transactionHistory}) {
    return (
      <div className="transactions card">
        <div className="transactions-header">
          <h2 className="card-title">Transaction History</h2>
          <div className="download-transaction">
            <ExportCSV transactionHistory={transactionHistory} />
          </div>
        </div>
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

export default connect(
  (state) => ({
    transactionHistory: state.transactionHistory,
  }),
  actions
)(TransactionHistory)
