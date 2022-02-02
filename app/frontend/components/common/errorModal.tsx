import {h} from 'preact'

import Modal from './modal'
import Alert from './alert'
import HelpSection from './helpSection'
import {ErrorHelpType} from '../../../frontend/types'

interface Props {
  onRequestClose: () => void
  title: string
  buttonTitle: string
  errorMessage: string
  helpType?: ErrorHelpType | null
}

const ErrorModal = ({onRequestClose, title, buttonTitle, errorMessage, helpType = null}: Props) => (
  <Modal onRequestClose={onRequestClose} title={title} showWarning={false} bodyClass="">
    <Alert alertType="error">{errorMessage}</Alert>
    {helpType && <HelpSection closeHandler={onRequestClose} helpType={helpType} />}
    <div className="modal-footer">
      <button className="button primary" onClick={onRequestClose}>
        {buttonTitle}
      </button>
    </div>
  </Modal>
)

export default ErrorModal
