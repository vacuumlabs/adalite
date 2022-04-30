import {h, Fragment} from 'preact'
import {Base64} from 'js-base64'
import {encodeAssetFingerprint} from '../../../wallet/shelley/helpers/addresses'
import printAda from '../../../helpers/printAda'
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
  AssetFamily,
} from '../../../types'
import {AdaIcon} from '../../common/svg'
import {
  FormattedAssetItem,
  FormattedAssetItemProps,
  FormattedHumanReadableLabelType,
} from '../../common/asset'
import styles from './transactionHistory.module.scss'
import Alert from '../../common/alert'
import * as moment from 'moment'
import {useActiveAccount} from '../../../selectors'
import {useSelector} from '../../../helpers/connect'
import {createTokenRegistrySubject} from '../../../tokenRegistry/tokenRegistry'
import printTokenAmount from '../../../helpers/printTokenAmount'

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
  </div>
)

const MultiAsset = (props: FormattedAssetItemProps) => {
  return (
    <FormattedAssetItem {...props}>
      {({
        icon,
        formattedHumanReadableLabelVariants,
        formattedAmount,
        formattedAssetLink,
        formattedFingerprint,
      }) => {
        const {quantity} = props
        return (
          <Fragment>
            <div className={`${styles.multiAssetRow} row`}>
              <div className="multi-asset-name shrinkable flex-nowrap">
                {formattedHumanReadableLabelVariants.label}
                {formattedAssetLink}
              </div>
              <div className={`${styles.amount} ${quantity > 0 ? 'credit' : 'debit'}`}>
                <div className={`${styles.quantity}`}>
                  {quantity > 0 ? `+${formattedAmount}` : formattedAmount}
                </div>
                {icon}
              </div>
            </div>
            {formattedHumanReadableLabelVariants.type ===
            FormattedHumanReadableLabelType.FINGERPRINT
              ? ''
              : formattedFingerprint}
          </Fragment>
        )
      }}
    </FormattedAssetItem>
  )
}

interface Props {
  transactionHistory: Array<TxSummaryEntry>
  stakingHistory: Array<StakingHistoryObject>
}

const ExportCSV = ({transactionHistory, stakingHistory}: Props): h.JSX.Element => {
  const tokensMetadata = useSelector((state) => state.tokensMetadata)

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
    'Date',
    'Transaction ID',
    'Type',
    'Received amount',
    'Received currency',
    'Sent amount',
    'Sent currency',
    'Fee amount',
    'Fee currency',
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
    fee?: Lovelace
    currency: string
  } & (
    | {
        assetFamily: AssetFamily.ADA
        sent?: Lovelace
        received?: Lovelace
      }
    | {
        assetFamily: AssetFamily.TOKEN
        sent?: number
        received?: number
        decimals: number
      }
  )

  const transactionsEntries: Array<TxEntry> = transactionHistory.flatMap(
    (transaction: TxSummaryEntry): Array<TxEntry> => {
      const common = {
        txHash: transaction.ctbId,
        dateTime: moment.utc(new Date(transaction.ctbTimeIssued * 1000)),
      }

      const createTokenEntries = (): Array<TxEntry> =>
        transaction.tokenEffects.map((tokenEffect: Token) => {
          const tokenMetadata = tokensMetadata.get(
            createTokenRegistrySubject(tokenEffect.policyId, tokenEffect.assetName)
          )
          const ticker = tokenMetadata?.ticker
          const fingerprint = encodeAssetFingerprint(tokenEffect.policyId, tokenEffect.assetName)
          return {
            ...common,
            ...(tokenEffect.quantity > 0
              ? {
                type: TxSummaryType.RECEIVED,
                received: tokenEffect.quantity,
              }
              : {
                type: TxSummaryType.SENT,
                sent: Math.abs(tokenEffect.quantity),
              }),
            assetFamily: AssetFamily.TOKEN,
            currency: ticker ? `${ticker} (${fingerprint})` : fingerprint,
            decimals: tokenMetadata?.decimals || 0,
          }
        })

      if (withdrawalHistory.hasOwnProperty(transaction.ctbId)) {
        return [
          {
            ...common,
            type: TxSummaryType.SENT,
            assetFamily: AssetFamily.ADA,
            sent: (Math.abs(transaction.effect - withdrawalHistory[transaction.ctbId]) -
              transaction.fee) as Lovelace,
            fee: transaction.fee,
            currency: 'ADA',
          },
        ]
      } else if (transaction.effect > 0) {
        return [
          {
            ...common,
            type: TxSummaryType.RECEIVED,
            assetFamily: AssetFamily.ADA,
            received: transaction.effect,
            currency: 'ADA',
          },
          ...createTokenEntries(),
        ]
      } else {
        return [
          {
            ...common,
            type: TxSummaryType.SENT,
            assetFamily: AssetFamily.ADA,
            sent: (Math.abs(transaction.effect) - transaction.fee) as Lovelace,
            fee: transaction.fee,
            currency: 'ADA',
          },
          ...createTokenEntries(),
        ]
      }
    }
  )

  const rewardsEntries: Array<TxEntry> = stakingRewards.map((stakingReward: StakingReward) => ({
    type: TxSummaryType.REWARD_AWARDED,
    assetFamily: AssetFamily.ADA,
    dateTime: moment(stakingReward.dateTime),
    received: stakingReward.reward,
    currency: 'ADA',
  }))

  const entries: Array<TxEntry> = [...transactionsEntries, ...rewardsEntries].sort(
    (a, b) => b.dateTime.unix() - a.dateTime.unix()
  )

  const rows: Array<string> = entries.map((entry) => {
    const printAmount = (amount: number | Lovelace) =>
      entry.assetFamily === AssetFamily.ADA
        ? printAda(amount as Lovelace)
        : printTokenAmount(amount, entry.decimals as number)
    return [
      entry.dateTime.format('MM/DD/YYYY hh:mm A [UTC]'),
      entry.txHash,
      entry.type,
      entry.received && printAmount(entry.received),
      entry.received !== undefined ? entry.currency : undefined,
      entry.sent && printAmount(entry.sent),
      entry.sent !== undefined ? entry.currency : undefined,
      entry.fee && printAda(entry.fee as Lovelace),
      entry.fee !== undefined ? 'ADA' : undefined,
    ]
      .map((value) => (value === undefined ? delimiter : `${value}${delimiter}`))
      .join('')
  })

  const fileContents = `${headers}${rowsDelimiter}${rows.join(rowsDelimiter)}`
  const filename = 'transactions.csv'
  const filetype = 'text/plain'

  const dataURI = `data:${filetype};base64,${Base64.encode(fileContents)}`

  return (
    <a href={dataURI} download={filename} className="download-transactions-text">
      Export to CSV
    </a>
  )
}

const TransactionHistory = (): h.JSX.Element => {
  const {transactionHistory, stakingHistory} = useActiveAccount()

  return (
    <div className="transactions card">
      <div className="transactions-header">
        <h2 className="card-title">Transaction History</h2>
        <div className="download-transaction">
          <ExportCSV transactionHistory={transactionHistory} stakingHistory={stakingHistory} />
        </div>
      </div>
      <div className="staking-history-warning">
        <Alert alertType="warning">
          Some rewards may be missing from the CSV export.{' '}
          <a
            href="https://github.com/vacuumlabs/adalite/wiki/Known-issue-with-missing-rewards"
            target="_blank"
            rel="noopener"
          >
            More info
          </a>
        </Alert>
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
                  type={AssetFamily.TOKEN}
                  assetName={tokenEffect.assetName}
                  policyId={tokenEffect.policyId}
                  quantity={tokenEffect.quantity}
                  fingerprint={encodeAssetFingerprint(tokenEffect.policyId, tokenEffect.assetName)}
                />
              ))}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

export default TransactionHistory
