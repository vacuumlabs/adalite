import {h} from 'preact'

interface Props {
  message: string
}

const ErrorBanner = ({message}: Props) => {
  return (
    <div className="banner error">
      <div className="banner-text">{message}</div>
    </div>
  )
}

export default ErrorBanner
