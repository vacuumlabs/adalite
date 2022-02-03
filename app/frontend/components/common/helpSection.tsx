import {h} from 'preact'
import {captureException} from '@sentry/browser'
import actions from '../../actions'
import {connect} from '../../helpers/connect'
import {ErrorHelpType} from '../../types'

interface Props {
  closeHandler: () => void
  error: any
  helpType: ErrorHelpType
}

const HelpSection = connect(
  (state) => ({
    error: state.error,
  }),
  actions
)(({closeHandler, error, helpType}: Props) => (
  <div className="modal-instructions">
    <p>
      If you are experiencing problems, please try the following{' '}
      <a href="https://github.com/vacuumlabs/adalite/wiki/Troubleshooting">
        troubleshooting suggestions
      </a>{' '}
      before contacting us.
    </p>
    {helpType === 'troubleshoot_and_contact' && (
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
    )}
  </div>
))

export default HelpSection
