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
  AssetFamily,
  CertificateType,
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
  encodeAssetFingerprint,
  encodeCatalystVotingKey,
} from '../../../wallet/shelley/helpers/addresses'
import {FormattedAssetItem, FormattedAssetItemProps} from '../../common/asset'
import * as assert from 'assert'
import {isHwWallet, getDeviceBrandName} from '../../../wallet/helpers/cryptoProviderUtils'
import {useGetCryptoProviderType} from '../../../selectors'
import printTokenAmount from '../../../helpers/printTokenAmount'
import BigNumber from 'bignumber.js'

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
  const cryptoProviderType = useGetCryptoProviderType()
  const {address, coins, fee, minimalLovelaceAmount, token} = transactionSummary
  const lovelaceAmount = coins.plus(minimalLovelaceAmount) as Lovelace
  const total = coins.plus(fee).plus(minimalLovelaceAmount) as Lovelace
  const formattedAssetItemProps: FormattedAssetItemProps | null = token && {
    ...token,
    fingerprint: encodeAssetFingerprint(token.policyId, token.assetName),
    type: AssetFamily.TOKEN,
  }

  return (
    <Fragment>
      <div className="review">
        <div className="review-label">Address</div>
        <div className="review-address">
          {address}
          {shouldShowAddressVerification && address && (
            <div className="review-address-verification">
              <AddressVerification address={address} />
            </div>
          )}
        </div>
        {token && formattedAssetItemProps && (
          <FormattedAssetItem {...formattedAssetItemProps}>
            {({
              formattedHumanReadableLabelVariants,
              formattedOnChainName,
              formattedAmount,
              formattedFingerprint,
            }) => {
              return (
                <Fragment>
                  <div className="review-label">Fingerprint</div>
                  <div className="review-value">{formattedFingerprint}</div>
                  <div className="review-label">Asset name</div>
                  <div className="review-value">{formattedOnChainName}</div>
                  <div className="review-label">Amount</div>
                  <div className="review-value">
                    <span data-cy="SendTokenAmount">{formattedAmount}</span>
                    {formattedHumanReadableLabelVariants.labelWithIcon}
                  </div>
                  {isHwWallet(cryptoProviderType) && (
                    <Fragment>
                      <div className="review-label">
                        Token amount on {getDeviceBrandName(cryptoProviderType)}
                      </div>
                      <div className="review-value" data-cy="SendTokenAmount">
                        {printTokenAmount(token.quantity, 0)}
                      </div>
                    </Fragment>
                  )}
                </Fragment>
              )
            }}
          </FormattedAssetItem>
        )}
        <div className="ada-label">Amount</div>
        <div className="review-value">{printAda(lovelaceAmount as Lovelace)}</div>
        <div className="ada-label">Network fees</div>
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
  const total = fee.plus(deposit) as Lovelace
  return (
    <Fragment>
      <div className="review">
        <div className="review-label">Pool ID</div>
        <div className="review-value">{stakePool.poolHash}</div>
        <div className="review-label">Pool Name</div>
        <div className="review-value">{stakePool.name}</div>
        <div className="review-label">Ticker</div>
        <div className="review-value">{stakePool.ticker}</div>
        <div className="review-label">Tax</div>
        <div className="review-value">{stakePool.margin && stakePool.margin * 100}%</div>
        <div className="review-label">Fixed cost</div>
        <div className="review-value">
          {stakePool.fixedCost && printAda(new BigNumber(stakePool.fixedCost) as Lovelace)}
        </div>
        <div className="review-label">Homepage</div>
        <div className="review-value">{stakePool.homepage}</div>
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
  const total = fee.plus(deposit) as Lovelace
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
        <div className="review-fee">{printAda(deposit.negated() as Lovelace)}</div>
        <div className="ada-label">Withdrawn rewards</div>
        <div className="review-fee">{printAda(rewards)}</div>
        <div className="ada-label">Fee</div>
        <div className="review-fee">{printAda(transactionSummary.fee as Lovelace)}</div>
        <div className="ada-label">Returned</div>
        <div className="review-total">{printAda(total.negated() as Lovelace)}</div>
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

const WithdrawDrepDelegationReview = ({
  transactionSummary,
}: {
  transactionSummary: TransactionSummary & WithdrawTransactionSummary
}) => {
  assert(transactionSummary.plan != null)
  const {rewards, fee} = transactionSummary
  const total = rewards.minus(fee) as Lovelace
  return (
    <Fragment>
      <Alert alertType="info">
        <div className="mb-6">
          In order to be a able to withdraw rewards, we first need you to make an empty delegation
          to a DRep. You may later modify it using{' '}
          <a href="https://nu.fi" target="_blank">
            NuFi wallet
          </a>{' '}
          through{' '}
          <a href="https://gov.tools" target="_blank">
            https://gov.tools
          </a>
          .
        </div>
        <div>
          Please sign this transaction and once it is submitted, you will be able to properly
          withdraw your staking rewards.
        </div>
      </Alert>
      <div className="review">
        <div className="review-label">Address</div>
        <div className="review-address">
          {transactionSummary.plan.change[0].address}
          <div className="review-address-verification">
            <AddressVerification address={transactionSummary.plan.change[0].address} />
          </div>
        </div>
        <div className="ada-label">Rewards</div>
        <div className="review-value">{'N/A'}</div>
        <div className="ada-label">Fee</div>
        <div className="review-fee">{printAda(fee)}</div>
        <div className="ada-label">Total</div>
        <div className="review-total">{printAda(total)}</div>
      </div>
    </Fragment>
  )
}

const WithdrawReview = ({
  transactionSummary,
}: {
  transactionSummary: TransactionSummary & WithdrawTransactionSummary
}) => {
  assert(transactionSummary.plan != null)
  const {rewards, fee} = transactionSummary
  const total = rewards.minus(fee) as Lovelace
  return (
    <Fragment>
      <div>
        We are creating a transaction that will withdraw all funds from your rewards account balance
        to your first staking address
      </div>
      <div className="review">
        <div className="review-label">Address</div>
        <div className="review-address">
          {transactionSummary.plan.change[0].address}
          <div className="review-address-verification">
            <AddressVerification address={transactionSummary.plan.change[0].address} />
          </div>
        </div>
        <div className="ada-label">Rewards</div>
        <div className="review-value">{printAda(rewards)}</div>
        <div className="ada-label">Fee</div>
        <div className="review-fee">{printAda(fee)}</div>
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
  assert(transactionSummary?.plan?.auxiliaryData != null)
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
        <div className="review-value">
          {encodeCatalystVotingKey(transactionSummary.plan.auxiliaryData.votingPubKey)}
        </div>
        <div className="review-label">Nonce</div>
        <div className="review-value">{`${transactionSummary.plan.auxiliaryData.nonce}`}</div>
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
  const total = coins.plus(fee) as Lovelace
  return (
    <Fragment>
      <div>
        We are creating a transaction that will send all funds from your non-staking addresses to
        your first staking address
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
        <div className="review-value">{printAda(coins)}</div>
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
    waitingHwWalletOperation,
  } = useSelector((state) => ({
    transactionSummary: state.transactionSummary,
    rawTransactionOpen: state.rawTransactionOpen,
    txConfirmType: state.txConfirmType,
    isCrossAccount: state.isCrossAccount,
    cachedTransactionSummaries: state.cachedTransactionSummaries,
    sendAddress: state.sendAddress.fieldValue,
    sourceAccountIndex: state.sourceAccountIndex,
    waitingHwWalletOperation: state.waitingHwWalletOperation,
  }))
  const {setRawTransactionOpen, submitTransaction, cancelTransaction} = useActions(actions)

  assert(txConfirmType != null)
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
    assert(txSummary != null)
    return submitTransaction({sendAddress, sourceAccountIndex, txSummary})
  }

  // Refactor: tmp util till all transactions types use "cachedTransactionSummaries"
  const getModalBody = () => {
    // Refactored cases:
    if (txConfirmType === TxType.DEREGISTER_STAKE_KEY) {
      const txSummary = cachedTransactionSummaries[TxType.DEREGISTER_STAKE_KEY]
      assert(txSummary != null)
      return (
        <DeregisterStakeKeyReview
          transactionSummary={txSummary}
          onSubmit={onSubmit}
          onCancel={cancelTransaction}
        />
      )
    }
    if (txConfirmType === TxType.DELEGATE) {
      const txSummary = cachedTransactionSummaries[TxType.DELEGATE]
      assert(txSummary != null)
      return <DelegateReview transactionSummary={txSummary} />
    }

    if (txConfirmType === TxType.REGISTER_VOTING) {
      const txSummary = cachedTransactionSummaries[TxType.REGISTER_VOTING]
      assert(txSummary != null)
      return <VotingRegistrationReview transactionSummary={txSummary} />
    }

    // To be refactored cases:
    switch (transactionSummary?.type) {
      case TxType.CONVERT_LEGACY:
        return <ConvertFundsReview transactionSummary={transactionSummary} />
      case TxType.WITHDRAW:
        if (
          transactionSummary.plan?.certificates.find(
            (cert) => cert.type === CertificateType.VOTE_DELEGATION
          )
        ) {
          return <WithdrawDrepDelegationReview transactionSummary={transactionSummary} />
        }
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

    if (isRefactoredCase) {
      return titleMap[txConfirmType]
    }

    return transactionSummary?.type ? titleMap[transactionSummary.type] : undefined
  })()

  return (
    <div>
      <Modal onRequestClose={cancelTransaction} title={modalTitle} closeOnClickOutside={false}>
        {getModalBody()}
        {!hideDefaultSummary && (
          <ReviewBottom
            disabled={!!waitingHwWalletOperation}
            onSubmit={onSubmit}
            onCancel={cancelTransaction}
          />
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
