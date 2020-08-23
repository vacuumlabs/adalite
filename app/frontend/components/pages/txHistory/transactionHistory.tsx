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
  const range = (n) => [...Array(n).keys()]

  const columnsPerIO = 2 // address, ada amount
  const delimiter = ','
  const rowsDelimiter = '\n'

  // Headers
  const maxInputsCount = Math.max(...transactionHistory.map((t) => t.ctbInputs.length))
  const maxOutputsCount = Math.max(...transactionHistory.map((t) => t.ctbOutputs.length))
  const maxInputsColumnCount = maxInputsCount * columnsPerIO
  const maxOutputsColumnCount = maxOutputsCount * columnsPerIO
  const inputHeaders = range(maxInputsCount)
    .map((i) => `Input ${i + 1} address${delimiter}Input ${i + 1} amount`)
    .join(delimiter)
  const outputHeaders = range(maxOutputsCount)
    .map((i) => `Output ${i + 1} address${delimiter}Output ${i + 1} amount`)
    .join(delimiter)

  const headers =
    `Transaction ID${delimiter}` +
    `Received date${delimiter}` +
    `${inputHeaders}${delimiter}` +
    `${outputHeaders}${delimiter}` +
    `Input sum${delimiter}` +
    `Output sum${delimiter}` +
    `Fee${delimiter}` +
    'Effect'

  // Rows
  const translateIOs = (ctbIOs, maxColumnCount) =>
    ctbIOs
      .map(
        (ctbIO) => `${ctbIO[0]}${delimiter}${printAda(ctbIO[1].getCoin as Lovelace)}${delimiter}`
      )
      .join('') + delimiter.repeat(maxColumnCount - ctbIOs.length * columnsPerIO)

  const rows = transactionHistory.map(
    (transaction) =>
      `${transaction.ctbId}${delimiter}` +
      `${new Date(transaction.ctbTimeIssued * 1000).toISOString()}${delimiter}` +
      `${translateIOs(transaction.ctbInputs, maxInputsColumnCount)}` +
      `${translateIOs(transaction.ctbOutputs, maxOutputsColumnCount)}` +
      `${printAda(transaction.ctbInputSum.getCoin as Lovelace)}${delimiter}` +
      `${printAda(transaction.ctbOutputSum.getCoin as Lovelace)}${delimiter}` +
      `${printAda(transaction.fee as Lovelace)}${delimiter}` +
      `${printAda(transaction.effect as Lovelace)}`
  )

  // Create file
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
