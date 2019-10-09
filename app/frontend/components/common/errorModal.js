const {h} = require('preact')

const Modal = require('./modal')
const Alert = require('./alert')

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
      ),
      showHelp &&
        h(
          'div',
          {},
          h(
            'p',
            {
              class: 'modal-paragraph',
            },
            'For more information, try our ',
            h(
              'a',
              {
                href: 'https://github.com/vacuumlabs/adalite/wiki',
              },
              'Help'
            ),
            ' section.'
          )
        )
    )
  )

module.exports = ErrorModal
