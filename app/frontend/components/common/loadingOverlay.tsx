import {h} from 'preact'
import {connect} from '../../helpers/connect'

interface Props {
  loading: boolean
  loadingMessage: string
}

const _LoadingOverlay = ({loading, loadingMessage}: Props) =>
  loading ? (
    <div className="loading">
      <div className="spinner">
        <span />
      </div>
      {loadingMessage ? <p className="loading-message">{loadingMessage}</p> : ''}
    </div>
  ) : null

const LoadingOverlay = connect((state) => ({
  loadingMessage: state.loadingMessage,
  loading: state.loading,
}))(_LoadingOverlay)

export default LoadingOverlay
