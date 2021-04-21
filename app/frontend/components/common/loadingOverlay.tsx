import {h} from 'preact'
import {useSelector} from '../../helpers/connect'

const LoadingOverlay = () => {
  const {loading, loadingMessage} = useSelector((state) => ({
    loadingMessage: state.loadingMessage,
    loading: state.loading,
  }))
  return loading ? (
    <div className="loading">
      <div className="spinner">
        <span />
      </div>
      {loadingMessage ? <p className="loading-message">{loadingMessage}</p> : ''}
    </div>
  ) : null
}

export default LoadingOverlay
