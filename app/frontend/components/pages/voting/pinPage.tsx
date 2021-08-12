import {Fragment, h} from 'preact'
import {Ref, useState} from 'preact/hooks'
import {stripNonNumericCharacters} from '../../../helpers/common'
import {VOTING_PIN_LENGTH} from '../../../wallet/constants'
import Alert from '../../common/alert'
import VotingDialogBottom from './votingDialogBottom'
import styles from './voting.module.scss'
import {useActions} from '../../../../frontend/helpers/connect'
import actions from '../../../../frontend/actions'

const PinPage = ({
  pin,
  updatePin,
  nextStep,
  previousStep,
  confirmPinRef,
}: {
  pin: string
  updatePin: (e) => void
  nextStep: () => void
  previousStep: () => void
  confirmPinRef: Ref<HTMLInputElement>
}): h.JSX.Element => {
  // https://github.com/preactjs/preact/issues/1899
  // PIN is encapsulated due to bug in preact which makes inputs uncontrolled
  const [confirmPin, setConfirmPin] = useState({value: ''})
  const [validationError, setValidationError] = useState(null)
  const {resetWalletOperationStatusType} = useActions(actions)

  const updateConfirmPin = (e): void => {
    resetWalletOperationStatusType()
    const strippedConfirmPin = stripNonNumericCharacters(e.target.value)
    setConfirmPin({value: strippedConfirmPin})
    if (
      pin.length === VOTING_PIN_LENGTH &&
      strippedConfirmPin.length === VOTING_PIN_LENGTH &&
      pin !== strippedConfirmPin
    ) {
      setValidationError('The PINs are not equal')
    } else {
      setValidationError(null)
    }
  }

  return (
    <Fragment>
      <Alert alertType="warning">
        This PIN will be required <strong>every time</strong> you use the Catalyst Voting
        Application on your phone. Make sure to <strong>write it down</strong>! Losing this PIN will
        require a <strong>new</strong> Voting Key registration!
      </Alert>
      <div className={styles.pinCodes}>
        <label htmlFor="first-pin">{VOTING_PIN_LENGTH}-digit PIN</label>
        <input
          type="password"
          className="input"
          id="first-pin"
          name="first-pin"
          value={pin}
          onInput={(e) => {
            updatePin(e)
            setConfirmPin({value: ''})
          }}
          maxLength={VOTING_PIN_LENGTH}
          data-cy="VotingFirstPin"
        />
        <label htmlFor="second-pin">Confirm PIN</label>
        <input
          type="password"
          className="input"
          id="second-pin"
          name="second-pin"
          value={confirmPin.value}
          onInput={updateConfirmPin}
          maxLength={VOTING_PIN_LENGTH}
          ref={confirmPinRef}
          data-cy="VotingSecondPin"
        />
      </div>
      {validationError && (
        <div className="validation-error-field">
          <div className="validation-message error" data-cy="VotingErrorMessage">
            {validationError}
          </div>
        </div>
      )}

      <VotingDialogBottom
        nextStep={nextStep}
        previousStep={previousStep}
        nextButtonName="Confirm PIN"
        nextButtonDisabled={
          !(
            pin.length === VOTING_PIN_LENGTH &&
            confirmPin.value.length === VOTING_PIN_LENGTH &&
            pin === confirmPin.value
          )
        }
      />
    </Fragment>
  )
}

export default PinPage
