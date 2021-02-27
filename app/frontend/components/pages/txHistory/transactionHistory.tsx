import {h, Fragment} from 'preact'
import {assetNameHex2Readable} from '../../../wallet/shelley/helpers/addresses'
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
  HexString,
  Lovelace,
  TxSummaryEntry,
  Token,
} from '../../../types'
import {AdaIcon, StarIcon} from '../../common/svg'
import moment = require('moment')

const FormattedAmount = ({amount}: {amount: Lovelace}): h.JSX.Element => {
  const value = printAda(amount)
  return (
    <div className={`transaction-amount ${amount > 0 ? 'credit' : 'debit'}`}>
      {amount > 0 ? `+${value}` : value}
      <AdaIcon />
    </div>
  )
}

const FormattedFee = ({fee}: {fee: Lovelace}): h.JSX.Element => {
  const value = printAda(fee)
  return (
    <div className="transaction-fee nowrap">
      {`Fee: ${value}`}
      <AdaIcon />
    </div>
  )
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

type MultiAssetProps = {
  star: boolean
  name: string
  hash: string
  amount: number
}

const MultiAsset = ({star, name, hash, amount}: MultiAssetProps) => (
  <Fragment>
    <div className="row">
      <div className="multi-asset-name">
        {star && <StarIcon />}
        {assetNameHex2Readable(name)}
      </div>
      <div className={`multi-asset-amount ${amount > 0 ? 'credit' : 'debit'}`}>
        {amount > 0 ? `+${amount}` : amount}
      </div>
    </div>
    <div className="multi-asset-hash">
      <span className="ellipsis">{hash.slice(0, -6)}</span>
      {hash.slice(-6)}
    </div>
  </Fragment>
)

interface Props {
  transactionHistory: Array<TxSummaryEntry>
  stakingHistory: Array<StakingHistoryObject>
}

const ExportCSV = ({transactionHistory, stakingHistory}: Props): h.JSX.Element => {
  const withdrawalHistory: {[key: string]: Lovelace} = stakingHistory
    .filter((item) => item.type === StakingHistoryItemType.REWARD_WITHDRAWAL)
    .reduce((acc, withdrawal: RewardWithdrawal) => {
      acc[withdrawal.txHash] = withdrawal.amount
      return acc
    }, {})

  const stakingRewards = stakingHistory.filter(
    (item) => item.type === StakingHistoryItemType.STAKING_REWARD
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

  const enum TxSummaryType {
    RECEIVED = 'Received',
    SENT = 'Sent',
    REWARD_AWARDED = 'Reward awarded',
  }

  type TxEntry = {
    type: TxSummaryType
    txHash?: string
    dateTime: moment.Moment
    sent?: Lovelace
    received?: Lovelace
    fee?: Lovelace
  }

  const transactionsEntries: Array<TxEntry> = transactionHistory.map(
    (transaction: TxSummaryEntry) => {
      const common = {
        txHash: transaction.ctbId,
        dateTime: moment.utc(new Date(transaction.ctbTimeIssued * 1000)),
      }

      if (withdrawalHistory.hasOwnProperty(transaction.ctbId)) {
        return {
          ...common,
          type: TxSummaryType.SENT,
          sent: (Math.abs(transaction.effect - withdrawalHistory[transaction.ctbId]) -
            transaction.fee) as Lovelace,
          fee: transaction.fee,
        }
      } else if (transaction.effect > 0) {
        return {
          ...common,
          type: TxSummaryType.RECEIVED,
          received: transaction.effect,
        }
      } else {
        return {
          ...common,
          type: TxSummaryType.SENT,
          sent: (Math.abs(transaction.effect) - transaction.fee) as Lovelace,
          fee: transaction.fee,
        }
      }
    }
  )

  const rewardsEntries: Array<TxEntry> = stakingRewards.map((stakingReward: StakingReward) => ({
    type: TxSummaryType.REWARD_AWARDED,
    dateTime: moment(stakingReward.dateTime),
    received: stakingReward.reward,
  }))

  const entries: Array<TxEntry> = [...transactionsEntries, ...rewardsEntries].sort(
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
        {transactionHistory.map((transaction: TxSummaryEntry) => (
          <li key={transaction.ctbId} className="transaction-item">
            <div className="row">
              <div className="transaction-date">
                {toLocalDate(new Date(transaction.ctbTimeIssued * 1000))}
              </div>
              <FormattedAmount amount={transaction.effect} />
            </div>
            <div className="row">
              <FormattedTransaction txid={transaction.ctbId} />
              <FormattedFee fee={transaction.fee} />
            </div>
            {transaction.tokenEffects.map((tokenEffect: Token) => (
              <MultiAsset
                key={tokenEffect.policyId}
                star={false}
                name={tokenEffect.assetName}
                hash={tokenEffect.policyId}
                amount={tokenEffect.quantity}
              />
            ))}
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
