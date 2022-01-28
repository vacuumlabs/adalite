import {h} from 'preact'
import {useActions, useSelector} from '../../../helpers/connect'
import actions from '../../../actions'
import assertUnreachable from '../../../helpers/assertUnreachable'

const PinkSpinner = ({message}) => (
  <div className="header-message">
    {message.split('\n').map((line, i) => (
      <p className="loading-message black" key={i}>
        {line}
      </p>
    ))}
    <div className="spinner pink">
      <span />
    </div>
  </div>
)

export const WalletOperationStatusType = () => {
  const {resetWalletOperationStatusType} = useActions(actions)

  const {walletOperationStatusType} = useSelector((state) => ({
    walletOperationStatusType: state.walletOperationStatusType,
  }))
  switch (walletOperationStatusType) {
    case 'txPending':
      return <PinkSpinner message={'Transaction pending...'} />
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
