import {h} from 'preact'
import styles from './voting.module.scss'

const VotingDialogBottom = ({
  nextStep,
  previousStep,
  nextButtonName,
  previousButtonName = 'Back',
  nextButtonDisabled = false,
}: {
  nextStep: () => void
  previousStep: () => void
  nextButtonName: string
  previousButtonName?: string
  nextButtonDisabled?: boolean
}) => {
  return (
    <div className={styles.votingDialogBottom}>
      <button className="button secondary" onClick={previousStep} data-cy="VotingBottomPreviousBtn">
        {previousButtonName}
      </button>
      <button
        className="button primary"
        disabled={nextButtonDisabled}
        onClick={nextStep}
        data-cy="VotingBottomNextBtn"
      >
        {nextButtonName}
      </button>
    </div>
  )
}

export default VotingDialogBottom
