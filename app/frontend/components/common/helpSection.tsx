import {h} from 'preact'
import {captureException} from '@sentry/browser'
import actions from '../../actions'
import {connect} from '../../libs/unistore/preact'

interface Props {
  closeHandler: () => void
  error: any
}

const HelpSection = connect(
  (state) => ({
    error: state.error,
  }),
  actions
)(({closeHandler, error}: Props) => (
  <div className="modal-instructions">
    <p>
      If you are experiencing problems, please try the following{' '}
      <a href="https://github.com/vacuumlabs/adalite/wiki">troubleshooting suggestions</a> before
      contacting us.
    </p>
    <p>
      Didn't help?{' '}
      <a
        onClick={() => {
          closeHandler()
          captureException(error)
        }}
      >
        Send
      </a>{' '}
      us the error.
    </p>
  </div>
))

export default HelpSection
