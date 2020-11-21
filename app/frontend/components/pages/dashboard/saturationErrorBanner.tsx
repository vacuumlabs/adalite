import {h} from 'preact'
import ErrorBanner from '../login/errorBanner'

const SaturationErrorBanner = () => {
  const message =
    'The pool you are delegating to is saturated. Delegate to another pool to get the most rewards.'
  return (
    <a style={'width: 100%;margin-bottom: 20px;'}>
      <ErrorBanner message={message} />
    </a>
  )
}

export default SaturationErrorBanner
