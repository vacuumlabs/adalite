import {h} from 'preact'
import {connect} from '../../libs/unistore/preact'

interface Props {
  loading: boolean
  loadingMessage: string
}

const LoadingOverlay = connect(['loadingMessage', 'loading'])(
  ({loading, loadingMessage}: Props) =>
    loading ? (
      <div className="loading">
        <div className="spinner">
          <span />
        </div>
        {loadingMessage ? <p className="loading-message">{loadingMessage}</p> : ''}
      </div>
    ) : null
)

export default LoadingOverlay
