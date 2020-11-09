import {h, Component} from 'preact'
import {connect} from '../../../helpers/connect'
import actions from '../../../actions'
import isLeftClick from '../../../helpers/isLeftClick'

import KeyFileAuth from './keyFileAuth'
import MnemonicAuth from './mnemonicAuth'
import HardwareAuth from './hardwareAuth'
import DemoWalletWarningDialog from './demoWalletWarningDialog'
import GenerateMnemonicDialog from './generateMnemonicDialog'
import LogoutNotification from './logoutNotification'
import LoginPageSidebar from './loginPageSidebar'
import StakingBanner from './stakingBanner'
import ErrorBanner from './errorBanner'
import Tag from '../../common/tag'
import WalletLoadingErrorModal from './walletLoadingErrorModal'
import {getTranslation} from '../../../translations'
import {errorHasHelp} from '../../../helpers/errorsWithHelp'
// import {ADALITE_CONFIG} from '../../../config'

const AUTH_METHOD_NAMES = {
  'mnemonic': 'Mnemonic',
  'hw-wallet': 'Hardware Wallet',
  'file': 'Key file',
}

const ENABLE_HW_WALLETS = true

const getAuthMethodName = (authMethod) => AUTH_METHOD_NAMES[authMethod]

interface Props {
  closeStakingBanner: () => void
  loadWallet: any
  loadDemoWallet: any
  walletLoadingError: any
  authMethod: '' | 'mnemonic' | 'hw-wallet' | 'file'
  setAuthMethod: (option: string) => void
  shouldShowDemoWalletWarningDialog: boolean
  logoutNotificationOpen: boolean
  shouldShowGenerateMnemonicDialog: boolean
  shouldShowWalletLoadingErrorModal: boolean
  closeWalletLoadingErrorModal: any
  shouldShowStakingBanner: boolean
  autoLogin: boolean
  errorBannerContent: any
  loadErrorBannerContent: any
}

class LoginPage extends Component<Props, {isDropdownOpen: boolean}> {
  constructor(props) {
    super(props)
    this.state = {
      isDropdownOpen: false,
    }
    this.toggleDropdown = this.toggleDropdown.bind(this)
    this.closeStakingBannerClick = this.closeStakingBannerClick.bind(this)
  }

  componentDidMount() {
    if (this.props.autoLogin && this.props.authMethod !== 'mnemonic') {
      this.props.setAuthMethod('mnemonic')
    }
    this.props.loadErrorBannerContent()
  }

  closeStakingBannerClick() {
    this.props.closeStakingBanner()
  }

  toggleDropdown() {
    this.setState({isDropdownOpen: !this.state.isDropdownOpen})
  }

  render(
    {
      loadWallet,
      loadDemoWallet,
      walletLoadingError,
      authMethod,
      setAuthMethod,
      shouldShowDemoWalletWarningDialog,
      logoutNotificationOpen,
      shouldShowGenerateMnemonicDialog,
      shouldShowWalletLoadingErrorModal,
      closeWalletLoadingErrorModal,
      shouldShowStakingBanner,
      errorBannerContent,
    },
    {isDropdownOpen}
  ) {
    const CurrentDropdownItem = (authMethod) => (
      <div
        className={`dropdown-item current ${authMethod} ${
          authMethod === 'hw-wallet' ? 'recommended' : ''
        }`}
        onClick={this.toggleDropdown}
      >
        <span className="dropdown-item-text">{getAuthMethodName(authMethod)}</span>
      </div>
    )
    const DropdownItem = (name, recommended = false) => (
      <li
        className={`dropdown-item ${name} ${authMethod === name ? 'selected' : ''} ${
          recommended ? 'recommended' : ''
        }`}
        onClick={() => {
          this.toggleDropdown()
          setAuthMethod(name)
        }}
      >
        <span className={`dropdown-item-text ${name}`}>{getAuthMethodName(name)}</span>
      </li>
    )
    const AuthTab = (name, recommended = false) => (
      <li
        className={`auth-tab ${name} ${authMethod === name ? 'selected' : ''} ${
          recommended ? 'recommended' : ''
        }`}
        onClick={() => setAuthMethod(name)}
      >
        <span className={`auth-tab-text ${name}`}>{getAuthMethodName(name)}</span>
      </li>
    )
    const AuthOption = (type, texts, tag) => (
      <div className={`auth-option ${type}`} onClick={() => setAuthMethod(type)}>
        {tag && <Tag type={`auth ${tag}`} text={tag} />}
        <h3 className="auth-option-title">{getAuthMethodName(type)}</h3>
        {texts.map((text, i) => (
          <p key={i} className="auth-option-text">
            {text}
          </p>
        ))}
      </div>
    )
    const AuthCardInitial = () => (
      <div className="authentication card initial">
        <h2 className="authentication-title">How do you want to access your Cardano Wallet?</h2>
        <div className="auth-options">
          {AuthOption('mnemonic', ['12, 15, 24 or 27 word passphrase'], 'fastest')}
          {ENABLE_HW_WALLETS &&
            AuthOption(
              'hw-wallet',
              ['Trezor T', 'Ledger Nano S/X', 'Android device & Ledger'],
              'recommended'
            )}
          {AuthOption('file', ['Encrypted .JSON file'], '')}
        </div>
      </div>
    )
    const AuthCard = () => (
      <div className="authentication card">
        <ul className="auth-tabs">
          {AuthTab('mnemonic')}
          {ENABLE_HW_WALLETS && AuthTab('hw-wallet', true)}
          {AuthTab('file')}
        </ul>
        <div className={`dropdown auth ${isDropdownOpen ? 'open' : ''}`}>
          {CurrentDropdownItem(authMethod)}
          <ul className="dropdown-items">
            {DropdownItem('mnemonic')}
            {ENABLE_HW_WALLETS && DropdownItem('hw-wallet')}
            {DropdownItem('file')}
          </ul>
        </div>
        {authMethod === 'mnemonic' && <MnemonicAuth />}
        {authMethod === 'hw-wallet' && <HardwareAuth loadWallet={loadWallet} />}
        {authMethod === 'file' && <KeyFileAuth />}
      </div>
    )
    // getErrorBannerContent()
    return (
      <div className="page-wrapper">
        {shouldShowStakingBanner && <StakingBanner onRequestClose={this.closeStakingBannerClick} />}
        {errorBannerContent && <ErrorBanner message={errorBannerContent} />}
        <div className="page-inner">
          <main className="page-main">
            {authMethod === '' ? <AuthCardInitial /> : <AuthCard />}
            <div className="page-demo">
              Try the <a onMouseDown={(e) => isLeftClick(e, loadDemoWallet)}>demo wallet</a>
            </div>
          </main>
          <LoginPageSidebar />
          {shouldShowDemoWalletWarningDialog && <DemoWalletWarningDialog />}
          {shouldShowGenerateMnemonicDialog && <GenerateMnemonicDialog />}
          {logoutNotificationOpen && <LogoutNotification />}
          {shouldShowWalletLoadingErrorModal && (
            <WalletLoadingErrorModal
              onRequestClose={closeWalletLoadingErrorModal}
              errorMessage={getTranslation(walletLoadingError.code, walletLoadingError.params)}
              showHelp={errorHasHelp(walletLoadingError.code)}
            />
          )}
        </div>
      </div>
    )
  }
}

export default connect(
  (state) => ({
    authMethod: state.authMethod,
    shouldShowDemoWalletWarningDialog: state.shouldShowDemoWalletWarningDialog,
    logoutNotificationOpen: state.logoutNotificationOpen,
    walletLoadingError: state.walletLoadingError,
    shouldShowGenerateMnemonicDialog: state.shouldShowGenerateMnemonicDialog,
    shouldShowWalletLoadingErrorModal: state.shouldShowWalletLoadingErrorModal,
    shouldShowStakingBanner: state.shouldShowStakingBanner,
    autoLogin: state.autoLogin,
    errorBannerContent: state.errorBannerContent,
  }),
  actions
)(LoginPage)
