const {h, Component} = require('preact')
const connect = require('unistore/preact').connect
const actions = require('../../../actions')
const isLeftClick = require('../../../helpers/isLeftClick')

const KeyFileAuth = require('./keyFileAuth')
const MnemonicAuth = require('./mnemonicAuth')
const HardwareAuth = require('./hardwareAuth')
const DemoWalletWarningDialog = require('./demoWalletWarningDialog')
const GenerateMnemonicDialog = require('./generateMnemonicDialog')
const LogoutNotification = require('./logoutNotification')
const LoginPageSidebar = require('./loginPageSidebar')
const Tag = require('../../common/tag')
const Banner = require('../../common/banner')
const WalletLoadingErrorModal = require('./walletLoadingErrorModal')
const {getTranslation} = require('../../../translations')

const AUTH_METHOD_NAMES = {
  'mnemonic': 'Mnemonic',
  'hw-wallet': 'Hardware Wallet',
  'file': 'Key file',
}

const getAuthMethodName = (authMethod) => AUTH_METHOD_NAMES[authMethod]

class LoginPage extends Component {
  constructor(props) {
    super(props)
    this.state = {
      isDropdownOpen: false,
    }
    this.toggleDropdown = this.toggleDropdown.bind(this)
    this.closeBannerClick = this.closeBannerClick.bind(this)
  }

  closeBannerClick() {
    this.props.closeBanner()
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
      enableTrezor,
      showDemoWalletWarningDialog,
      logoutNotificationOpen,
      showGenerateMnemonicDialog,
      showWalletLoadingErrorModal,
      closeWalletLoadingErrorModal,
      showBanner,
    },
    {isDropdownOpen}
  ) {
    const currentDropdownItem = (authMethod) =>
      h(
        'div',
        {
          class: `dropdown-item current ${authMethod} ${
            authMethod === 'hw-wallet' ? 'recommended' : ''
          }`,
          onClick: this.toggleDropdown,
        },
        h('span', {class: 'dropdown-item-text'}, getAuthMethodName(authMethod))
      )
    const dropdownItem = (name, recommended) =>
      h(
        'li',
        {
          class: `dropdown-item ${name} ${authMethod === name ? 'selected' : ''} ${
            recommended ? 'recommended' : ''
          }`,
          onClick: () => {
            this.toggleDropdown()
            setAuthMethod(name)
          },
        },
        h('span', {class: `dropdown-item-text ${name}`}, getAuthMethodName(name))
      )
    const authTab = (name, recommended) =>
      h(
        'li',
        {
          class: `auth-tab ${name} ${authMethod === name ? 'selected' : ''} ${
            recommended ? 'recommended' : ''
          }`,
          onClick: () => setAuthMethod(name),
        },
        h('span', {class: `auth-tab-text ${name}`}, getAuthMethodName(name))
      )
    const authOption = (type, texts, tag) =>
      h(
        'div',
        {class: `auth-option ${type}`, onClick: () => setAuthMethod(type)},
        tag && h(Tag, {type: `auth ${tag}`, text: tag}),
        h('h3', {class: 'auth-option-title'}, getAuthMethodName(type)),
        ...texts.map((text) => h('p', {class: 'auth-option-text'}, text))
      )
    const authCardInitial = () =>
      h(
        'div',
        {class: 'authentication card initial'},
        h('h2', {class: 'authentication-title'}, 'How do you want to access\nyour Cardano Wallet?'),
        h(
          'div',
          {class: 'auth-options'},
          authOption('mnemonic', ['12, 15 or 27 word passphrase'], 'fastest'),
          authOption(
            'hw-wallet',
            ['Trezor T', 'Ledger Nano S/X', 'Android device & Ledger'],
            'recommended'
          ),
          authOption('file', ['Encrypted .JSON file'])
        )
      )
    const authCard = () =>
      h(
        'div',
        {class: 'authentication card'},
        h(
          'ul',
          {class: 'auth-tabs'},
          authTab('mnemonic'),
          authTab('hw-wallet', true),
          authTab('file')
        ),
        h(
          'div',
          {class: `dropdown auth ${isDropdownOpen ? 'open' : ''}`},
          currentDropdownItem(authMethod),
          h(
            'ul',
            {class: 'dropdown-items'},
            dropdownItem('mnemonic'),
            dropdownItem('hw-wallet', true),
            dropdownItem('file')
          )
        ),
        authMethod === 'mnemonic' && h(MnemonicAuth),
        authMethod === 'hw-wallet' && h(HardwareAuth, {loadWallet}),
        authMethod === 'file' && h(KeyFileAuth)
      )
    return h(
      'div',
      {class: 'page-wrapper'},
      showBanner && h(Banner, {closeBanner: this.closeBannerClick}),
      h(
        'div',
        {class: 'page-inner'},
        h(
          'main',
          {class: 'page-main'},
          authMethod === '' ? h(authCardInitial) : h(authCard),
          h(
            'div',
            {class: 'page-demo'},
            'Try the ',
            h(
              'a',
              {
                href: '#',
                onMouseDown: (e) => isLeftClick(e, loadDemoWallet),
              },
              'demo wallet'
            )
          )
        ),
        h(LoginPageSidebar),
        showDemoWalletWarningDialog && h(DemoWalletWarningDialog),
        showGenerateMnemonicDialog && h(GenerateMnemonicDialog),
        logoutNotificationOpen && h(LogoutNotification),
        showWalletLoadingErrorModal &&
          h(WalletLoadingErrorModal, {
            closeHandler: closeWalletLoadingErrorModal,
            errorMessage: getTranslation(walletLoadingError.code, walletLoadingError.params),
          })
      )
    )
  }
}

module.exports = connect(
  (state) => ({
    authMethod: state.authMethod,
    showDemoWalletWarningDialog: state.showDemoWalletWarningDialog,
    logoutNotificationOpen: state.logoutNotificationOpen,
    walletLoadingError: state.walletLoadingError,
    showGenerateMnemonicDialog: state.showGenerateMnemonicDialog,
    showWalletLoadingErrorModal: state.showWalletLoadingErrorModal,
    showBanner: state.showBanner,
  }),
  actions
)(LoginPage)
