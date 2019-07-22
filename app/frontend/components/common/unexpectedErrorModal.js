const {h} = require('preact')

const Modal = require('./modal')
const Alert = require('./alert')

const Sentry = require('@sentry/browser')

Sentry.init({dsn: 'https://d77d3bf9d9364597badab9c00fa59a31@sentry.io/1501383'})

const submitToSentry = (e) => {
  Sentry.captureException(e)
}

const ExceptionModal = ({closeHandler, e}) =>
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
      e.toString()
    ),
    h(
      'div',
      {class: 'modal-footer'},
      h(
        'button',
        {
          class: 'button primary outline',
          onClick: closeHandler,
        },
        'Cancel'
      ),
      h(
        'button',
        {
          class: 'button primary',
          onClick: submitToSentry(e),
        },
        'Send'
      )
    )
  )

module.exports = ExceptionModal
