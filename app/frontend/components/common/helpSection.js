const {h} = require('preact')
const Sentry = require('@sentry/browser')
const actions = require('../../actions')
const connect = require('unistore/preact').connect

const HelpSection = connect(
  (state) => ({
    error: state.error,
  }),
  actions
)(({error}) =>
  h(
    'div',
    {},
    h(
      'p',
      {
        class: 'modal-instructions',
      },
      'If you are experiencing problems, please try the following ',
      h(
        'a',
        {
          href: 'https://github.com/vacuumlabs/adalite/wiki',
        },
        'troubleshooting suggestions'
      ),
      ' before contacting us.'
    ),
    h(
      'p',
      {
        class: 'modal-instructions',
      },
      "Didn't help?",
      h(
        'a',
        {
          onClick: () => {
            Sentry.captureEvent(error)
          },
        },
        'Send'
      ),
      ' us the error.'
    )
  )
)

module.exports = HelpSection
