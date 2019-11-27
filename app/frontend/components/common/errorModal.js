import {h} from 'preact'

import Modal from './modal'
import Alert from './alert'
import HelpSection from './helpSection'

const ErrorModal = ({closeHandler, title, buttonTitle, errorMessage, showHelp = false}) =>
  h(
    Modal,
    {
      closeHandler,
      title,
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
