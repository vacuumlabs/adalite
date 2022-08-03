import {Component, h} from 'preact'
import {captureException} from '@sentry/browser'
import {connect} from '../helpers/connect'
import actions from '../actions'
import UnexpectedErrorModal from './common/unexpectedErrorModal'

interface Props {
  shouldShowUnexpectedErrorModal: boolean
}
class ErrorBoundary extends Component<Props, {}> {
  state = {errorCaughtAtBoundary: null}

  static getDerivedStateFromError(error) {
    return {errorCaughtAtBoundary: error.message}
  }

  componentDidCatch(error) {
    captureException(error)
  }

  render() {
    const isUnhandledError = this.state.errorCaughtAtBoundary != null

    return (
      <span>
        {!isUnhandledError && this.props.children}
        {this.props.shouldShowUnexpectedErrorModal && (
          <UnexpectedErrorModal reloadPageOnClose={isUnhandledError} />
        )}
      </span>
    )
  }
}

export default connect(
  (state) => ({
    shouldShowUnexpectedErrorModal: state.shouldShowUnexpectedErrorModal,
  }),
  actions
)(ErrorBoundary)
