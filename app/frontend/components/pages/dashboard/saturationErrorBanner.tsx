import {h} from 'preact'
import ErrorBanner from '../login/errorBanner'

const SaturationErrorBanner = () => {
  const message = 'One of the pool you are delegating to is saturated.'
  return (
    <a style={'width: 100%;margin-bottom: 20px;'}>
      <ErrorBanner message={message} />
    </a>
  )
}

export default SaturationErrorBanner
