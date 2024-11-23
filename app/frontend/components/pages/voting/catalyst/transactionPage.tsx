import {Fragment, h} from 'preact'
import actions from '../../../../actions'
import {useActions, useSelector} from '../../../../helpers/connect'
import {HexString} from '../../../../types'
import Alert from '../../../common/alert'
import VotingDialogBottom from './votingDialogBottom'
import styles from './voting.module.scss'
import {WalletOperationStatusType} from '../../dashboard/walletOperationStatus'
import {shouldDisableSendingButton} from '../../../../helpers/common'

const TransactionPage = ({
  nextStep,
  previousStep,
  votingPublicKey,
}: {
  nextStep: () => void
  previousStep: () => void
  votingPublicKey: HexString
}): h.JSX.Element => {
  const {registerVotingKey} = useActions(actions)
  const {txSuccessTab, walletOperationStatusType} = useSelector((state) => ({
    txSuccessTab: state.txSuccessTab,
    walletOperationStatusType: state.walletOperationStatusType,
  }))

  const submitHandler = async () => {
    await registerVotingKey({votingPubKey: votingPublicKey})
  }

  return (
    <Fragment>
      <Alert alertType="info">
        We have constructed the Voting Registration transaction, which connects the voting key to
        this wallet. The higher amount of funds it holds, the more voting power it disposes with.{' '}
        <strong>No funds are supposed to leave your wallet</strong>. However, the registration
        requires paying the transaction fees.
      </Alert>
      <Alert alertType="warning">
        Make sure to keep your account balance above 25 ADA at least until the voting round starts,
        otherwise your voting key registration would be dismissed.
      </Alert>
      <WalletOperationStatusType />
      <div className={styles.reviewTransactionRow}>
        <button
          className="button primary"
          disabled={
            txSuccessTab === 'voting' || shouldDisableSendingButton(walletOperationStatusType)
          }
          onClick={submitHandler}
          data-cy="VotingReviewTransactionBtn"
        >
          Review transaction
        </button>
      </div>
      <VotingDialogBottom
        nextStep={nextStep}
        previousStep={previousStep}
        nextButtonName="Proceed"
        nextButtonDisabled={txSuccessTab !== 'voting'}
        previousButtonDisabled={txSuccessTab === 'voting'}
      />
    </Fragment>
  )
}

export default TransactionPage
