import {h, Fragment} from 'preact'
import {useState} from 'preact/hooks'
import {useSelector, useActions} from '../../../helpers/connect'
import actions from '../../../actions'
import printAda from '../../../helpers/printAda'
import Modal from '../../common/modal'
import RawTransactionModal from './rawTransactionModal'
import AddressVerification from '../../common/addressVerification'
import tooltip from '../../common/tooltip'
import Alert from '../../common/alert'
import {
  DelegateTransactionSummary,
  DeregisterStakingKeyTransactionSummary,
  Lovelace,
  SendTransactionSummary,
  TransactionSummary,
  TxType,
  VotingRegistrationTransactionSummary,
  WithdrawTransactionSummary,
} from '../../../types'
import {
  assetNameHex2Readable,
  encodeAssetFingerprint,
  encodeCatalystVotingKey,
} from '../../../../frontend/wallet/shelley/helpers/addresses'

interface ReviewBottomProps {
  onSubmit: () => any
  onCancel: () => any
  disabled: boolean
}

const ReviewBottom = ({onSubmit, onCancel, disabled}: ReviewBottomProps) => {
  return (
    <div className="review-bottom">
      <button
        className="button primary"
        onClick={onSubmit}
        disabled={disabled}
        data-cy="ConfirmTransactionBtn"
      >
        Confirm Transaction
      </button>
      <a
        className="review-cancel"
        onClick={onCancel}
        onKeyDown={(e) => {
          e.key === 'Enter' && (e.target as HTMLAnchorElement).click()
        }}
      >
        Cancel Transaction
      </a>
    </div>
  )
}

const SendAdaReview = ({
  transactionSummary,
  shouldShowAddressVerification,
}: {
  transactionSummary: TransactionSummary & SendTransactionSummary
  shouldShowAddressVerification: boolean
}) => {
  const {address, coins, fee, minimalLovelaceAmount, token} = transactionSummary
  const lovelaceAmount = (coins + minimalLovelaceAmount) as Lovelace
  const total = (coins + fee + minimalLovelaceAmount) as Lovelace

  return (
    <Fragment>
      <div className="review">
        <div className="review-label">Address</div>
        <div className="review-address">
          {address}
          {shouldShowAddressVerification && (
            <div className="review-address-verification">
              <AddressVerification address={address} />
            </div>
          )}
        </div>
        {/* TODO: Hide ADA symbol when handling tokens */}
        <div className="ada-label">Amount</div>
        <div className="review-amount">{printAda(lovelaceAmount as Lovelace)}</div>
        {token && (
          <Fragment>
            <div className="review-label">Token fingerprint</div>
            <div className="review-amount">
              {encodeAssetFingerprint(token.policyId, token.assetName)}
            </div>
            <div className="review-label">Token policy Id</div>
            <div className="review-amount">{token.policyId}</div>
            <div className="review-label">Token name</div>
            <div className="review-amount">{assetNameHex2Readable(token.assetName)}</div>
            <div className="review-label">Token amount</div>
            <div className="review-amount" data-cy="SendTokenAmount">
              {token.quantity}
            </div>
            {/* <div className="ada-label">Minimal Lovelace amount</div>
            <div className="review-amount">{printAda(minimalLovelaceAmount)}</div> */}
          </Fragment>
        )}
        <div className="ada-label">Fee</div>
        <div className="review-fee">{printAda(fee as Lovelace)}</div>
        {/* TODO: Hide ADA symbol when handling tokens */}
        <div className="ada-label">Total</div>
        <div className="review-total" data-cy="SendAmountTotal">
          {printAda(total)}
        </div>
      </div>
    </Fragment>
  )
}

const DelegateReview = ({
  transactionSummary,
}: {
  transactionSummary: TransactionSummary & DelegateTransactionSummary
}) => {
  const {stakePool, deposit, fee} = transactionSummary
  const total = (fee + deposit) as Lovelace
  return (
    <Fragment>
      <div className="review">
        <div className="review-label">Pool ID</div>
        <div className="review-amount">{stakePool.poolHash}</div>
        <div className="review-label">Pool Name</div>
        <div className="review-amount">{stakePool.name}</div>
        <div className="review-label">Ticker</div>
        <div className="review-amount">{stakePool.ticker}</div>
        <div className="review-label">Tax</div>
        <div className="review-amount">{stakePool.margin && stakePool.margin * 100}%</div>
        <div className="review-label">Fixed cost</div>
        <div className="review-amount">{stakePool.fixedCost && printAda(stakePool.fixedCost)}</div>
        <div className="review-label">Homepage</div>
        <div className="review-amount">{stakePool.homepage}</div>
        <div className="ada-label">Deposit</div>
        <div className="review-fee">
          {printAda(deposit)}
          <a
            {...tooltip(
              'Required deposit for address stake key registration is 2 ADA. Deposit is made with your first delegation. Further delegations do not require any additional deposits.',
              true
            )}
          >
            <span className="show-info">{''}</span>
          </a>
        </div>
        <div className="ada-label">Fee</div>
        <div className="review-fee">{printAda(transactionSummary.fee as Lovelace)}</div>
        {/* TODO: Hide ADA symbol when handling tokens */}
        <div className="ada-label">Total</div>
        <div className="review-total">{printAda(total)}</div>
      </div>
    </Fragment>
  )
}

const DeregisterStakeKeyReview = ({
  transactionSummary,
  onSubmit,
  onCancel,
}: {
  transactionSummary: TransactionSummary & DeregisterStakingKeyTransactionSummary
  onSubmit: () => any
  onCancel: () => any
}) => {
  const {deposit, fee, rewards} = transactionSummary
  const total = (fee + deposit) as Lovelace
  const [checked, setChecked] = useState(false)
  return (
    <div className="deregister-staking-key-dialog">
      <Alert alertType="warning">
        You do NOT need to deregister to delegate to a different stake pool. You can change your
        delegation preference at any time just by delegating to another stake pool.
      </Alert>
      <Alert alertType="warning">
        Deregistering means this key will no longer receive rewards until you re-register the
        staking key (usually by delegating to a pool again). Do NOT deregister if you are elligible
        for rewards in the following epoch.
      </Alert>
      <Alert alertType="error">
        You should NOT deregister if this staking key is used as a stake pool's reward account, as
        this will cause all pool operator rewards to be sent back to the reserve.
      </Alert>
      <div className="review deregister-staking-key">
        <div className="ada-label">Returned deposit</div>
        <div className="review-fee">{printAda(-deposit as Lovelace)}</div>
        <div className="ada-label">Withdrawn rewards</div>
        <div className="review-fee">{printAda(rewards)}</div>
        <div className="ada-label">Fee</div>
        <div className="review-fee">{printAda(transactionSummary.fee as Lovelace)}</div>
        <div className="ada-label">Returned</div>
        <div className="review-total">{printAda(-total as Lovelace)}</div>
      </div>
      <label className="checkbox deregister-stake-key-check">
        <input
          type="checkbox"
          checked={checked}
          onChange={() => setChecked(!checked)}
          className="checkbox-input"
        />
        <span className="checkbox-indicator" />I understand all the above warnings.
      </label>
      <ReviewBottom {...{onSubmit, onCancel, disabled: !checked}} />
    </div>
  )
}

const WithdrawReview = ({
  transactionSummary,
}: {
  transactionSummary: TransactionSummary & WithdrawTransactionSummary
}) => {
  const {rewards, fee} = transactionSummary
  const total = (rewards - fee) as Lovelace
  return (
    <Fragment>
      <div>
        We are creating transaction that will withdraw all funds from your rewards account balance
        to your first staking address
      </div>
      <div className="review">
        <div className="review-label">Address</div>
        <div className="review-address">
          {transactionSummary.plan.change.address}
          <div className="review-address-verification">
            <AddressVerification address={transactionSummary.plan.change.address} />
          </div>
        </div>
        <div className="ada-label">Rewards</div>
        <div className="review-amount">{printAda(rewards)}</div>
        <div className="ada-label">Fee</div>
        <div className="review-fee">{printAda(fee)}</div>
        {/* TODO: Hide ADA symbol when handling tokens */}
        <div className="ada-label">Total</div>
        <div className="review-total">{printAda(total)}</div>
      </div>
    </Fragment>
  )
}

const VotingRegistrationReview = ({
  transactionSummary,
}: {
  transactionSummary: TransactionSummary & VotingRegistrationTransactionSummary
}) => {
  const {fee} = transactionSummary
  const total = fee as Lovelace
  return (
    <Fragment>
      <div className="review">
        <div className="review-label">Reward address</div>
        <div className="review-address">
          {transactionSummary.plan.auxiliaryData.rewardDestinationAddress.address}
        </div>
        <div className="review-label">Voting key</div>
        <div className="review-amount">
          {encodeCatalystVotingKey(transactionSummary.plan.auxiliaryData.votingPubKey)}
        </div>
        <div className="review-label">Nonce</div>
        <div className="review-amount">{`${transactionSummary.plan.auxiliaryData.nonce}`}</div>
        <div className="ada-label">Fee</div>
        <div className="review-fee" data-cy="VotingFeeAmount">
          {printAda(fee)}
        </div>
        <div className="ada-label">Total</div>
        <div className="review-total" data-cy="VotingTotalAmount">
          {printAda(total)}
        </div>
      </div>
    </Fragment>
  )
}

const ConvertFundsReview = ({
  transactionSummary,
}: {
  transactionSummary: TransactionSummary & SendTransactionSummary
}) => {
  const {address, coins, fee} = transactionSummary
  const total = (coins + fee) as Lovelace
  return (
    <Fragment>
      <div>
        We are creating transaction that will send all funds from your non-staking addresses to your
        first staking address
      </div>
      <div className="review">
        <div className="review-label">Address</div>
        <div className="review-address">
          {address}
          <div className="review-address-verification">
            <AddressVerification address={address} />
          </div>
        </div>
        <div className="ada-label">Amount</div>
        <div className="review-amount">{printAda(coins)}</div>
        <div className="ada-label">Fee</div>
        <div className="review-fee">{printAda(fee as Lovelace)}</div>
        {/* TODO: Hide ADA symbol when handling tokens */}
        <div className="ada-label">Total</div>
        <div className="review-total">{printAda(total)}</div>
      </div>
    </Fragment>
  )
}

const ConfirmTransactionDialog = () => {
  const {
    rawTransactionOpen,
    transactionSummary,
    txConfirmType,
    isCrossAccount,
    cachedTransactionSummaries,
    sendAddress,
    sourceAccountIndex,
  } = useSelector((state) => ({
    transactionSummary: state.sendTransactionSummary,
    rawTransactionOpen: state.rawTransactionOpen,
    txConfirmType: state.txConfirmType,
    isCrossAccount: state.isCrossAccount,
    cachedTransactionSummaries: state.cachedTransactionSummaries,
    sendAddress: state.sendAddress.fieldValue,
    sourceAccountIndex: state.sourceAccountIndex,
  }))
  const {setRawTransactionOpen, submitTransaction, cancelTransaction} = useActions(actions)

  // Tmp, till all transaction types use `cachedTransactionSummaries`
  const isRefactoredCase =
    txConfirmType === TxType.DELEGATE ||
    txConfirmType === TxType.DEREGISTER_STAKE_KEY ||
    txConfirmType === TxType.REGISTER_VOTING

  const titleMap: {[key in TxType]: string} = {
    [TxType.DELEGATE]: 'Delegation review',
    [TxType.SEND_ADA]: 'Transaction review',
    [TxType.CONVERT_LEGACY]: 'Stakable balance conversion review',
    [TxType.WITHDRAW]: 'Rewards withdrawal review',
    [TxType.POOL_REG_OWNER]: '',
    [TxType.DEREGISTER_STAKE_KEY]: 'Deregister stake key',
    [TxType.REGISTER_VOTING]: 'Voting registration review',
    // crossAccount: 'Transaction between accounts review',
  }
  const hideDefaultSummary = txConfirmType === TxType.DEREGISTER_STAKE_KEY

  const onSubmit = () => {
    const txSummary = isRefactoredCase
      ? cachedTransactionSummaries[txConfirmType]
      : transactionSummary
    return submitTransaction({sendAddress, sourceAccountIndex, txSummary})
  }

  // Refactor: tmp util till all transactions types use "cachedTransactionSummaries"
  const getModalBody = () => {
    // Refactored cases:
    if (txConfirmType === TxType.DEREGISTER_STAKE_KEY) {
      return (
        <DeregisterStakeKeyReview
          transactionSummary={cachedTransactionSummaries[TxType.DEREGISTER_STAKE_KEY]}
          onSubmit={onSubmit}
          onCancel={cancelTransaction}
        />
      )
    }
    if (txConfirmType === TxType.DELEGATE) {
      return <DelegateReview transactionSummary={cachedTransactionSummaries[TxType.DELEGATE]} />
    }

    if (txConfirmType === TxType.REGISTER_VOTING) {
      return (
        <VotingRegistrationReview
          transactionSummary={cachedTransactionSummaries[TxType.REGISTER_VOTING]}
        />
      )
    }

    // To be refactored cases:
    switch (transactionSummary.type) {
      case TxType.CONVERT_LEGACY:
        return <ConvertFundsReview transactionSummary={transactionSummary} />
      case TxType.WITHDRAW:
        return <WithdrawReview transactionSummary={transactionSummary} />
      case TxType.SEND_ADA:
        return (
          <SendAdaReview
            transactionSummary={transactionSummary}
            shouldShowAddressVerification={isCrossAccount}
          />
        )
      default:
        return null
    }
  }

  const enablesRawTransaction = !(txConfirmType === TxType.REGISTER_VOTING)
  const modalTitle = (() => {
    if (isCrossAccount) return 'Transaction between accounts review'
    return isRefactoredCase ? titleMap[txConfirmType] : titleMap[transactionSummary.type]
  })()

  return (
    <div>
      <Modal onRequestClose={cancelTransaction} title={modalTitle}>
        {getModalBody()}
        {!hideDefaultSummary && (
          <ReviewBottom disabled={false} onSubmit={onSubmit} onCancel={cancelTransaction} />
        )}
        {enablesRawTransaction && (
          <a href="#" className="send-raw" onClick={() => setRawTransactionOpen(true)}>
            Raw unsigned transaction
          </a>
        )}
        {rawTransactionOpen && <RawTransactionModal />}
      </Modal>
    </div>
  )
}

export default ConfirmTransactionDialog
