import {h} from 'preact'
import {connect, useActions} from '../../../helpers/connect'
import actions from '../../../actions'
import {ADALITE_CONFIG} from '../../../config'
import NufiBanner from '../nufiBanner'
import {useEffect} from 'preact/hooks'
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
}

const NavbarAuth = ({isDemoWallet}: {isDemoWallet: boolean}) => {
  let scrollDestination: any
  const {openWelcome, openInfoModal, logout} = useActions(actions)

  const scrollToTop = () => {
    if (window.innerWidth < 767) {
      window.scrollTo(0, scrollDestination.offsetHeight)
    } else {
      window.scrollTo(0, 0)
    }
  }

  useEffect(() => {
    scrollToTop()
  })
  return (
    <nav
      className={`navbar authed ${isDemoWallet ? 'demo' : ''}`}
      ref={(element) => {
        scrollDestination = element
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
          {window.innerWidth > 1024 && (
            <div style={{padding: '0 10px'}}>
              <NufiBanner variant="static" />
            </div>
          )}
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
        <button className="button secondary logout" onClick={() => setTimeout(logout, 100)}>
          Logout
        </button>
      </div>
    </nav>
  )
}

export default connect(
  (state) => ({
    isDemoWallet: state.isDemoWallet,
    router: state.router,
  }),
  actions
)(NavbarAuth)
