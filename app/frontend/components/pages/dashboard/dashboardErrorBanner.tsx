import {h} from 'preact'
import ErrorBanner from '../login/errorBanner'
import {connect} from '../../../helpers/connect'
import actions from '../../../actions'

const DashboardErrorBanner = ({openNonShelleyCompatibleDialog}) => {
  const message = 'You are using Shelley incompatible wallet. Click to read more.'
  return (
    <a style={'width: 100%;margin-bottom: 20px;'} onClick={openNonShelleyCompatibleDialog}>
      <ErrorBanner message={message} />
    </a>
  )
}

export default connect(
  () => null,
  actions
)(DashboardErrorBanner)
