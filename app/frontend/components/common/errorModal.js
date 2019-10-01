const {h} = require('preact')

const Modal = require('./modal')
const Alert = require('./alert')
const HelpSection = require('./helpSection')

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

module.exports = ErrorModal
