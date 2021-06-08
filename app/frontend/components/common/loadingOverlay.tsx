import {h} from 'preact'
import {useSelector} from '../../helpers/connect'

const LoadingOverlay = () => {
  const toArray = (message: string | string[]) =>
    message ? (Array.isArray(message) ? message : [message]) : ['']

  const {loading, loadingMessage} = useSelector((state) => ({
    loadingMessage: toArray(state.loadingMessage),
    loading: state.loading,
  }))

  return loading ? (
    <div className="loading">
      <div className="spinner">
        <span />
      </div>
      {loadingMessage.map((line: string, i: number) => (
        <p className="loading-message" key={i}>
          {line}
        </p>
      ))}
    </div>
  ) : null
}

export default LoadingOverlay
