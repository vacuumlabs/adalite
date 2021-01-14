import {h, Component} from 'preact'
import printAda from '../../../helpers/printAda'
import {activeAccountState, Lovelace, State} from '../../../state'
import {ADALITE_CONFIG} from '../../../config'
import actions from '../../../actions'
import {connect} from '../../../libs/unistore/preact'
import toLocalDate from '../../../helpers/toLocalDate'
import {RewardWithdrawal, StakingHistoryItemType} from '../delegations/stakingHistoryPage'
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
          href={`https://blockchair.com/cardano/transaction/${txid}`}
          target="_blank"
          rel="noopener"
        >
          Blockchair
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
          href={`https://cardanoscan.io/transaction/${txid}`}
          target="_blank"
          rel="noopener"
        >
          CardanoScan
        </a>
        {/* <span> | </span> */}
        {/* <a
          className="transaction-address"
          href={`hhttps://explorer.cardano.org/en/transaction?id=${txid}`}
          target="_blank"
          rel="noopener"
        >
          CardanoExplorer
        </a> */}
        <span> | </span>
        <a
          className="transaction-address"
          href={`https://adaex.org/${txid}`}
          target="_blank"
          rel="noopener"
        >
          ADAex
        </a>
      </span>
    )}
  </div>
)

interface Props {
  transactionHistory: any
}

const ExportCSV = ({transactionHistory, stakingHistory}) => {
  const withdrawalHistory = stakingHistory
    .filter((item) => item.type === StakingHistoryItemType.RewardWithdrawal)
    .reduce((acc, withdrawal: RewardWithdrawal) => {
      acc[withdrawal.txHash] = withdrawal.amount
      return acc
    }, {})

  const stakingRewards = stakingHistory.filter(
    (item) => item.type === StakingHistoryItemType.StakingReward
  )

  const delimiter = ','
  const rowsDelimiter = '\n'

  const headers = [
    'Type',
    'Received amount',
    'Received currency',
    'Sent amount',
    'Sent currency',
    'Fee amount',
    'Fee currency',
    'Transaction ID',
    'Date',
  ]
    .map((header) => `${header}${delimiter}`)
    .join('')

  const transactionTypes = {
    received: 'Received',
    sent: 'Sent',
    rewardAwarded: 'Reward awarded',
  }

  const transactionsEntries = transactionHistory.map((transaction) => {
    const common = {
      txHash: transaction.ctbId,
      dateTime: moment.utc(new Date(transaction.ctbTimeIssued * 1000)),
    }

    if (withdrawalHistory.hasOwnProperty(transaction.ctbId)) {
      return {
        ...common,
        type: transactionTypes.sent,
        sent: Math.abs(transaction.effect - withdrawalHistory[transaction.ctbId]) - transaction.fee,
        fee: transaction.fee,
      }
    } else if (transaction.effect > 0) {
      return {
        ...common,
        type: transactionTypes.received,
        received: transaction.effect,
      }
    } else {
      return {
        ...common,
        type: transactionTypes.sent,
        sent: Math.abs(transaction.effect) - transaction.fee,
        fee: transaction.fee,
      }
    }
  })

  const rewardsEntries = stakingRewards.map((stakingReward) => ({
    type: transactionTypes.rewardAwarded,
    dateTime: moment(stakingReward.dateTime),
    received: stakingReward.reward,
  }))

  const entries = [...transactionsEntries, ...rewardsEntries].sort(
    (a, b) => b.dateTime - a.dateTime
  )

  const rows = entries.map((entry) =>
    [
      entry.type,
      entry.received && printAda(entry.received as Lovelace),
      entry.received !== undefined ? 'ADA' : undefined,
      entry.sent && printAda(entry.sent as Lovelace),
      entry.sent !== undefined ? 'ADA' : undefined,
      entry.fee && printAda(entry.fee as Lovelace),
      entry.fee !== undefined ? 'ADA' : undefined,
      entry.txHash,
      entry.dateTime.format('MM/DD/YYYY hh:mm A [UTC]'),
    ]
      .map((value) => (value === undefined ? delimiter : `${value}${delimiter}`))
      .join('')
  )

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
  render({transactionHistory, stakingHistory}) {
    const formatDate = (date) => toLocalDate(new Date(date * 1000))

    return (
      <div className="transactions card">
        <div className="transactions-header">
          <h2 className="card-title">Transaction History</h2>
          <div className="download-transaction">
            <ExportCSV transactionHistory={transactionHistory} stakingHistory={stakingHistory} />
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
  (state: State) => ({
    transactionHistory: activeAccountState(state).transactionHistory,
    stakingHistory: activeAccountState(state).stakingHistory,
  }),
  actions
)(TransactionHistory)
