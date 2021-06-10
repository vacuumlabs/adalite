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
      {loadingMessage
        ? loadingMessage.split('\n').map((line, i) => (
          <p className="loading-message" key={i}>
            {line}
          </p>
        ))
        : ''}
    </div>
  ) : null
}

export default LoadingOverlay
