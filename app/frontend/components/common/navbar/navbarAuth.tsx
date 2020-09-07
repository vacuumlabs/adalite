import {h, Component} from 'preact'
import {connect} from '../../../helpers/connect'
import actions from '../../../actions'
import {ADALITE_CONFIG} from '../../../config'
import range from '../../../../frontend/wallet/helpers/range'
import {ACCOUNT_COUNT} from '../../../../frontend/wallet/constants'
const APP_VERSION = ADALITE_CONFIG.ADALITE_APP_VERSION

interface Router {
  pathname: string
  hash: string
}
interface Props {
  router: Router
  isDemoWallet: boolean
  logout: () => void
  openWelcome: any
  openInfoModal: any
  selectedAccount: number
  selectAccount: (state, selectedAccount) => void
}

class NavbarAuth extends Component<Props, {}> {
  state: {
    hideAccountDropdown: false
  }

  scrollDestination: any

  constructor(props) {
    super(props)
    this.scrollToTop = this.scrollToTop.bind(this)
  }

  scrollToTop() {
    if (window.innerWidth < 767) {
      window.scrollTo(0, this.scrollDestination.offsetHeight)
    } else {
      window.scrollTo(0, 0)
    }
  }

  componentDidMount() {
    this.scrollToTop()
  }

  componentDidUpdate(prevProps) {
    if (this.props.router.pathname !== prevProps.router.pathname) {
      this.scrollToTop()
    }
  }

  render({isDemoWallet, logout, openWelcome, openInfoModal, selectedAccount, selectAccount}) {
    return (
      <nav
        className={`navbar authed ${isDemoWallet ? 'demo' : ''}`}
        ref={(element) => {
          this.scrollDestination = element
        }}
      >
        <div className="navbar-wrapper">
          <h1 className="navbar-heading">
            <span className="navbar-title">AdaLite - Cardano Wallet</span>
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault()
                window.history.pushState({}, 'txHistory', 'txHistory')
              }}
            >
              <img
                src="assets/adalite-logo.svg"
                alt="AdaLite - Cardano Wallet"
                className="navbar-logo"
              />
            </a>
          </h1>
          {isDemoWallet && <div className="navbar-demo">Accessing demo wallet</div>}
          <div className="navbar-version">{`Ver. ${APP_VERSION}`}</div>
          <div className="navbar-content">
            <a
              className="navbar-link primary"
              href="#"
              onClick={(e) => {
                e.preventDefault()
                openInfoModal()
              }}
            >
              News
            </a>
            <a
              className="navbar-link"
              href="#"
              onClick={(e) => {
                e.preventDefault()
                openWelcome()
              }}
            >
              About
            </a>
            <a
              className="navbar-link"
              href="https://github.com/vacuumlabs/adalite/wiki/AdaLite-FAQ"
              target="_blank"
              rel="noopener"
            >
              Help
            </a>
          </div>
          <div className="account-dropdown">
            <button
              className="account-dropdown-button"
              onMouseEnter={() => this.setState({hideAccountDropdown: false})}
            >
              Account {selectedAccount}
            </button>
            <div
              className={`account-dropdown-content ${
                this.state.hideAccountDropdown ? 'hide' : 'show'
              }`}
            >
              {range(0, ACCOUNT_COUNT).map((i) => (
                <a
                  key={i}
                  onClick={() => {
                    selectAccount(i)
                    this.setState({hideAccountDropdown: true})
                  }}
                >
                  Account {i}
                </a>
              ))}
            </div>
          </div>
          <button className="button secondary logout" onClick={() => setTimeout(logout, 100)}>
            Logout
          </button>
        </div>
      </nav>
    )
  }
}

export default connect(
  (state) => ({
    isDemoWallet: state.isDemoWallet,
    router: state.router,
    selectedAccount: state.selectedAccount,
  }),
  actions
)(NavbarAuth)
