const {h} = require('preact')

const Modal = require('./modal')
const Alert = require('./alert')
const Sentry = require('@sentry/browser')

Sentry.init({dsn: 'https://d77d3bf9d9364597badab9c00fa59a31@sentry.io/1501383'})

const UnexpectedExceptionModal = ({closeHandler, e}) =>
  h(
    Modal,
    {
      closeHandler,
      title: 'Something went wrong.',
    },
    h(
      Alert,
      {
        alertType: 'error',
      },
      e.stack
    ),
    h(
      'div',
      {class: 'modal-footer send-error'},
      h(
        'button',
        {
          class: 'button outline',
          onClick: closeHandler,
        },
        'Cancel'
      ),
      h(
        'button',
        {
          class: 'button primary send-error',
          onClick: () => {
            Sentry.captureException(e)
            closeHandler()
          },
        },
        'Send'
      )
    )
  )

module.exports = UnexpectedExceptionModal
