import {h} from 'preact'

import Modal from './modal'
import Alert from './alert'
import HelpSection from './helpSection'

interface Props {
  closeHandler: () => void
  title: string
  buttonTitle: string
  errorMessage: string
  showHelp?: boolean
}

const ErrorModal = ({closeHandler, title, buttonTitle, errorMessage, showHelp = false}: Props) => (
  <Modal closeHandler={closeHandler} title={title} showWarning={false} bodyClass="">
    <Alert alertType="error">{errorMessage}</Alert>
    {showHelp && <HelpSection closeHandler={closeHandler} />}
    <div className="modal-footer">
      <button className="button primary" onClick={closeHandler}>
        {buttonTitle}
      </button>
    </div>
  </Modal>
)

export default ErrorModal
