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

const ErrorModal = ({closeHandler, title, buttonTitle, errorMessage, showHelp = false}: Props) =>
  h(
    Modal,
    {
      closeHandler,
      title,
      showWarning: false,
      bodyClass: '',
    },
    h(
      Alert,
      {
        alertType: 'error',
      },
      errorMessage
    ),
    showHelp && h(HelpSection, {closeHandler}),
    h(
      'div',
      {class: 'modal-footer'},
      h(
        'button',
        {
          class: 'button primary',
          onClick: closeHandler,
        },
        buttonTitle
      )
    )
  )

export default ErrorModal
