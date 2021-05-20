import {h} from 'preact'
import {connect} from '../../../helpers/connect'
import actions from '../../../actions'
import {ADALITE_CONFIG} from '../../../config'
import isLeftClick from '../../../helpers/isLeftClick'
const APP_VERSION = ADALITE_CONFIG.ADALITE_APP_VERSION

interface Props {
  pathname: string
  openGenerateMnemonicDialog: () => void
  openWelcome: () => void
}

const NavbarUnauth = connect(
  (state) => ({
    pathname: state.router.pathname,
  }),
  actions
)(({pathname, openGenerateMnemonicDialog, openWelcome}: Props) => (
  <nav className="navbar">
    <div className="navbar-wrapper">
      <h1 className="navbar-heading">
        <span className="navbar-title">AdaLite - Cardano Wallet</span>
        <a href="/">
          <img
            src="assets/adalite-logo.svg"
            alt="AdaLite - Cardano Wallet"
            className="navbar-logo"
          />
        </a>
      </h1>
      <div className="navbar-version">{`Ver. ${APP_VERSION}`}</div>
      <div className="navbar-content">
        <a
          className="navbar-link primary"
          href="#"
          onClick={(e) => {
            e.preventDefault()
            window.history.pushState({}, 'staking', 'staking')
          }}
        >
          Staking
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
          href="https://github.com/vacuumlabs/adalite/wiki"
          target="_blank"
          rel="noopener"
        >
          Help
        </a>
      </div>
      {pathname === '/staking' || pathname === '/exchange' ? (
        <button
          className="button outline navbar"
          onClick={(e) => {
            e.preventDefault()
            window.history.pushState({}, './', './')
          }}
        >
          Access the Wallet
        </button>
      ) : (
        <button
          className="button outline navbar"
          onMouseDown={(e) => isLeftClick(e, openGenerateMnemonicDialog)}
        >
          Create New Wallet
        </button>
      )}
    </div>
  </nav>
))

export default NavbarUnauth
