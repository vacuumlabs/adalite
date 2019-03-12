const {h} = require('preact')

const Modal = require('./modal')
const Alert = require('./alert')

const ErrorModal = ({closeHandler, title, buttonTitle, errorMessage}) =>
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
