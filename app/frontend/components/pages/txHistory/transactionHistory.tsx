import {h} from 'preact'
import printAda from '../../../helpers/printAda'
import {getActiveAccountInfo, State} from '../../../state'
import {ADALITE_CONFIG} from '../../../config'
import actions from '../../../actions'
import {connect} from '../../../libs/unistore/preact'
import toLocalDate from '../../../helpers/toLocalDate'
import {
  RewardWithdrawal,
  StakingHistoryItemType,
  StakingHistoryObject,
  StakingReward,
} from '../delegations/stakingHistoryPage'
import {HexString, Lovelace, Transaction} from '../../../types'
import moment = require('moment')

const FormattedAmount = ({amount}: {amount: Lovelace}): h.JSX.Element => {
  const value = printAda(Math.abs(amount) as Lovelace)
  const number = `${value}`.indexOf('.') === -1 ? `${value}.0` : `${value}`
  return (
    <div className={`transaction-amount ${amount > 0 ? 'credit' : 'debit'}`}>
      {`${number}`.padEnd(10)}
    </div>
  )
}

const FormattedFee = ({fee}: {fee: Lovelace}): h.JSX.Element => {
  const value = printAda(fee)
  return <div className="transaction-fee">{`Fee: ${value}`}</div>
}

const FormattedTransaction = ({txid}: {txid: HexString}): h.JSX.Element => (
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
  transactionHistory: Array<Transaction>
  stakingHistory: Array<StakingHistoryObject>
}

const ExportCSV = ({transactionHistory, stakingHistory}: Props): h.JSX.Element => {
  const withdrawalHistory: {[key: string]: Lovelace} = stakingHistory
    .filter((item) => item.type === StakingHistoryItemType.RewardWithdrawal)
    .reduce((acc, withdrawal: RewardWithdrawal) => {
      acc[withdrawal.txHash] = withdrawal.amount
      return acc
    }, {})

  const stakingRewards = stakingHistory.filter(
    (item) => item.type === StakingHistoryItemType.StakingReward
  ) as Array<StakingReward>

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

  const enum TransactionType {
    received = 'Received',
    sent = 'Sent',
    rewardAwarded = 'Reward awarded',
  }

  type Entry = {
    type: TransactionType
    txHash?: string
    dateTime: moment.Moment
    sent?: Lovelace
    received?: Lovelace
    fee?: Lovelace
  }

  const transactionsEntries: Array<Entry> = transactionHistory.map((transaction: Transaction) => {
    const common = {
      txHash: transaction.ctbId,
      dateTime: moment.utc(new Date(transaction.ctbTimeIssued * 1000)),
    }

    if (withdrawalHistory.hasOwnProperty(transaction.ctbId)) {
      return {
        ...common,
        type: TransactionType.sent,
        sent: (Math.abs(transaction.effect - withdrawalHistory[transaction.ctbId]) -
          transaction.fee) as Lovelace,
        fee: transaction.fee,
      }
    } else if (transaction.effect > 0) {
      return {
        ...common,
        type: TransactionType.received,
        received: transaction.effect,
      }
    } else {
      return {
        ...common,
        type: TransactionType.sent,
        sent: (Math.abs(transaction.effect) - transaction.fee) as Lovelace,
        fee: transaction.fee,
      }
    }
  })

  const rewardsEntries: Array<Entry> = stakingRewards.map((stakingReward: StakingReward) => ({
    type: TransactionType.rewardAwarded,
    dateTime: moment(stakingReward.dateTime),
    received: stakingReward.reward,
  }))

  const entries: Array<Entry> = [...transactionsEntries, ...rewardsEntries].sort(
    (a, b) => b.dateTime.unix() - a.dateTime.unix()
  )

  const rows: Array<string> = entries.map((entry) =>
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

const TransactionHistory = ({transactionHistory, stakingHistory}: Props): h.JSX.Element => (
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
        {transactionHistory.map((transaction: Transaction) => (
          <li key={transaction.ctbId} className="transaction-item">
            <div className="transaction-date">
              {toLocalDate(new Date(transaction.ctbTimeIssued * 1000))}
            </div>
            <FormattedAmount amount={transaction.effect} />
            <FormattedTransaction txid={transaction.ctbId} />
            <FormattedFee fee={transaction.fee} />
          </li>
        ))}
      </ul>
    )}
  </div>
)

export default connect(
  (state: State) => ({
    transactionHistory: getActiveAccountInfo(state).transactionHistory,
    stakingHistory: getActiveAccountInfo(state).stakingHistory,
  }),
  actions
)(TransactionHistory)
