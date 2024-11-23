import {h} from 'preact'
import {useEffect, useRef, useState} from 'preact/hooks'
import actions from '../../../../actions'
import assertUnreachable from '../../../../helpers/assertUnreachable'
import {stripNonNumericCharacters} from '../../../../helpers/common'
import {useActions} from '../../../../helpers/connect'
import {VOTING_PIN_LENGTH} from '../../../../wallet/constants'
import mnemonicToWalletSecretDef from '../../../../wallet/helpers/mnemonicToWalletSecretDef'
import {generateMnemonic} from '../../../../wallet/mnemonic'
import Modal from '../../../common/modal'
import PinPage from './pinPage'
import ProgressBar from './progressBar'
import QRPage from './QRPage'
import TransactionPage from './transactionPage'
import styles from './voting.module.scss'

enum RegistrationSteps {
  PIN = 0,
  TRANSACTION = 1,
  QR = 2,
}

const REGISTRATION_STEP_NAMES = {
  [RegistrationSteps.PIN]: 'Pin',
  [RegistrationSteps.TRANSACTION]: 'Transaction',
  [RegistrationSteps.QR]: 'QR Code',
}

const _generateCatalystKeyPair = async (): Promise<Buffer> => {
  const mnemonic = generateMnemonic(15)
  const {rootSecret} = await mnemonicToWalletSecretDef(mnemonic)
  return rootSecret
}

const VotingDialog = (): h.JSX.Element => {
  const [currentStep, setCurrentStep] = useState<RegistrationSteps>(RegistrationSteps.PIN)
  // https://github.com/preactjs/preact/issues/1899
  // PIN is encapsulated due to bug in preact which makes inputs uncontrolled
  const [pin, setPin] = useState<{value: string}>({value: ''})
  const [votingKeyPair, setVotingKeyPair] = useState({
    public: '',
    private: '',
  })
  const confirmPinInput = useRef<HTMLInputElement>(null)
  const {closeVotingDialog} = useActions(actions)

  const updatePin = (e): void => {
    const strippedPin = stripNonNumericCharacters(e.target.value)
    setPin({value: strippedPin})
    if (strippedPin.length === VOTING_PIN_LENGTH && confirmPinInput?.current) {
      confirmPinInput.current.focus()
    }
  }

  useEffect(() => {
    async function generateVotingKeys() {
      const keyPair = await _generateCatalystKeyPair()
      setVotingKeyPair({
        private: keyPair.slice(0, 64).toString('hex'),
        public: keyPair.slice(64, 96).toString('hex'),
      })
    }
    generateVotingKeys()
  }, [])

  const previousStep = () => {
    switch (currentStep) {
      case RegistrationSteps.PIN:
        closeVotingDialog()
        break
      case RegistrationSteps.TRANSACTION:
        setCurrentStep(RegistrationSteps.PIN)
        break
      case RegistrationSteps.QR:
        setCurrentStep(RegistrationSteps.TRANSACTION)
        break
      default:
    }
  }

  const nextStep = () => {
    switch (currentStep) {
      case RegistrationSteps.PIN:
        setCurrentStep(RegistrationSteps.TRANSACTION)
        break
      case RegistrationSteps.TRANSACTION:
        setCurrentStep(RegistrationSteps.QR)
        break
      case RegistrationSteps.QR:
        closeVotingDialog()
        break
      default:
    }
  }

  const renderStepPage = (registrationStep: RegistrationSteps) => {
    switch (registrationStep) {
      case RegistrationSteps.PIN:
        return (
          <PinPage
            pin={pin.value}
            confirmPinRef={confirmPinInput}
            updatePin={updatePin}
            nextStep={nextStep}
            previousStep={previousStep}
          />
        )
      case RegistrationSteps.TRANSACTION:
        return (
          <TransactionPage
            nextStep={nextStep}
            previousStep={previousStep}
            votingPublicKey={votingKeyPair.public}
          />
        )
      case RegistrationSteps.QR:
        return (
          <QRPage
            nextStep={nextStep}
            previousStep={previousStep}
            privateVotingKey={votingKeyPair.private}
            pin={pin.value}
          />
        )
      default:
        return assertUnreachable(registrationStep)
    }
  }

  return (
    <Modal
      onRequestClose={closeVotingDialog}
      bodyClass={styles.votingModal}
      title="Voting Registration"
      showWarning
      closeOnClickOutside={false}
    >
      <ProgressBar stepNames={Object.values(REGISTRATION_STEP_NAMES)} activeStep={currentStep} />
      {renderStepPage(currentStep)}
    </Modal>
  )
}

export default VotingDialog
