import {h} from 'preact'
import {captureException} from '@sentry/browser'
import actions from '../../actions'
import {connect} from '../../libs/unistore/preact'

const HelpSection = connect(
  (state) => ({
    error: state.error,
  }),
  actions
)(({closeHandler, error}) =>
  h(
    'div',
    {
      class: 'modal-instructions',
    },
    h(
      'p',
      {},
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
      {},
      "Didn't help? ",
      h(
        'a',
        {
          onClick: () => {
            closeHandler()
            captureException(error)
          },
        },
        'Send'
      ),
      ' us the error.'
    )
  )
)

export default HelpSection
