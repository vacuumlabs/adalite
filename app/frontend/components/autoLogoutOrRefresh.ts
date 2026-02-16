import {Component, h} from 'preact'
import {connect} from '../helpers/connect'
import actions from '../actions'
import {sessionStorageVars} from '../sessionStorage'
import InactivityWatcher from './common/inactivityWatcher'

interface Props {
  logout: () => void
  walletIsLoaded: boolean
  inactivityTimeoutMs: number
}

class AutoLogoutOrRefresh extends Component<Props, {}> {
  onTimeout = () => {
    if (!this.props.walletIsLoaded) {
      // we still want to refresh the page if the wallet is not loaded
      // to avoid issues with production firewall (cloudflare)
      // managed challenge expiration
      window.location.reload()
      return
    }
    window.sessionStorage.setItem(sessionStorageVars.INACTIVITY_LOGOUT, 'true')
    this.props.logout()
  }

  render() {
    const isEnabled = true
    const timeoutMs = this.props.inactivityTimeoutMs

    return h(InactivityWatcher, {
      isEnabled,
      timeoutMs,
      onTimeout: this.onTimeout,
    })
  }
}

export default connect(
  (state) => ({
    walletIsLoaded: state.walletIsLoaded,
  }),
  actions
)(AutoLogoutOrRefresh)
