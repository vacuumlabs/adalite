import {Fragment, h, JSX} from 'preact'
import {useState, useEffect} from 'preact/hooks'

import {useActions, useSelector} from '../../../helpers/connect'
import actions from '../../../actions'
import assertUnreachable from '../../../helpers/assertUnreachable'

const DelayRendering = ({children}) => {
  const [showHelperText, setShowHelperText] = useState(false)

  useEffect(() => {
    const timeId = setTimeout(() => {
      setShowHelperText(true)
    }, 10000)

    return () => {
      clearTimeout(timeId)
    }
  }, [])

  return <Fragment>{showHelperText && children}</Fragment>
}

const PinkSpinner = ({message, helperText}: {message: string; helperText?: JSX.Element}) => {
  return (
    <div className={`header-message ${helperText ? 'helper-text-wrapper' : ''}`}>
      {message.split('\n').map((line, i) => (
        <p className="loading-message black" key={i}>
          {line}
        </p>
      ))}
      <div className="spinner pink">
        <span />
      </div>
      {helperText && <div className="header-message-helper-text">{helperText}</div>}
    </div>
  )
}

export const WalletOperationStatusType = () => {
  const {resetWalletOperationStatusType} = useActions(actions)

  const {walletOperationStatusType} = useSelector((state) => ({
    walletOperationStatusType: state.walletOperationStatusType,
  }))
  switch (walletOperationStatusType) {
    case 'txPending':
      return (
        <PinkSpinner
          message={'Transaction pending...'}
          helperText={
            <DelayRendering>
              <p className="loading-helper-text">
                Taking too long? Read why{' '}
                <a
                  href="https://github.com/vacuumlabs/adalite/wiki/Troubleshooting#my-transaction-has-been-pending-for-a-long-time--what-should-i-do"
                  target="_blank"
                >
                  here
                </a>
                .
              </p>
            </DelayRendering>
          }
        />
      )
    case 'reloading':
      return <PinkSpinner message={'Reloading wallet...'} />
    case 'txSuccess':
      return (
        <div className="header-message" onClick={resetWalletOperationStatusType}>
          <div className="loading-message black">Transaction successful!</div>
          <div className="green-checkmark" />
        </div>
      )
    case 'txSubmitting':
      return <PinkSpinner message={'Submitting transaction...'} />
    case 'reloadFailed':
      return (
        <div className="header-message" onClick={resetWalletOperationStatusType}>
          <div className="loading-message black">Reload failed!</div>
          <div className="red-warning"> </div>
        </div>
      )
    case 'txFailed':
      return (
        <div className="header-message" onClick={resetWalletOperationStatusType}>
          <div className="loading-message black">Transaction error</div>
          <div className="red-warning"> </div>
        </div>
      )
    case null:
      return (
        <div className="header-message">
          <div className="loading-message black" />
        </div>
      )
    default:
      return assertUnreachable(walletOperationStatusType)
  }
}
