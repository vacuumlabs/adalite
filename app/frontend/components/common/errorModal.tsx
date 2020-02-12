import {h} from 'preact'

import Modal from './modal'
import Alert from './alert'
import HelpSection from './helpSection'

interface Props {
  onRequestClose: () => void
  title: string
  buttonTitle: string
  errorMessage: string
  showHelp?: boolean
}

const ErrorModal = ({
  onRequestClose,
  title,
  buttonTitle,
  errorMessage,
  showHelp = false,
}: Props) => (
  <Modal onRequestClose={onRequestClose} title={title} showWarning={false} bodyClass="">
    <Alert alertType="error">{errorMessage}</Alert>
    {showHelp && <HelpSection closeHandler={onRequestClose} />}
    <div className="modal-footer">
      <button className="button primary" onClick={onRequestClose}>
        {buttonTitle}
      </button>
    </div>
  </Modal>
)

export default ErrorModal
