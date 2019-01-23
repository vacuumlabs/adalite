const {h, Component} = require('preact')
const connect = require('unistore/preact').connect
const actions = require('../../../actions')
const isLeftClick = require('../../../helpers/isLeftClick')

const Welcome = require('./welcome')
const KeyFileAuth = require('./keyFileAuth')
const MnemonicAuth = require('./mnemonicAuth')
const HardwareAuth = require('./hardwareAuth')
const DemoWalletWarningDialog = require('./demoWalletWarningDialog')
const GenerateMnemonicDialog = require('./generateMnemonicDialog')
const LogoutNotification = require('./logoutNotification')
const LoginPageSidebar = require('./loginPageSidebar')
const Tag = require('../../common/tag')

class LoginPage extends Component {
  render({
    loadWallet,
    loadDemoWallet,
    walletLoadingError,
    authMethod,
    setAuthMethod,
    showDemoWalletWarningDialog,
    logoutNotificationOpen,
    displayWelcome,
    showGenerateMnemonicDialog,
  }) {
    const authTab = (name, text, recommended) =>
      h(
        'li',
        {
          class: `auth-tab ${name} ${authMethod === name ? 'selected' : ''} ${
            recommended ? 'recommended' : ''
          }`,
          onClick: () => setAuthMethod(name),
        },
        h('span', {class: `auth-tab-text ${name}`}, text)
      )
    const authOption = (type, title, text, tag) =>
      h(
        'div',
        {class: `auth-option ${type}`, onClick: () => setAuthMethod(type)},
        tag && h(Tag, {type: `auth ${tag}`, text: tag}),
        h('h3', {class: 'auth-option-title'}, title),
        h('p', {class: 'auth-option-text'}, text)
      )
    const authCardInitial = () =>
      h(
        'div',
        {class: 'authentication card initial'},
        h('h2', {class: 'authentication-title'}, 'How do you want to access\nyour Cardano Wallet?'),
        h(
          'div',
          {class: 'auth-options'},
          authOption('mnemonic', 'Mnemonic', '12 or 27 word passphrase', 'fastest'),
          authOption('trezor', 'Hardware Wallet', 'Supporting Trezor T', 'recommended'),
          authOption('file', 'Key file', 'Encrypted .JSON file')
        )
      )
    const authCard = () =>
      h(
        'div',
        {class: 'authentication card'},
        h(
          'ul',
          {class: 'auth-tabs'},
          authTab('mnemonic', 'Mnemonic'),
          authTab('trezor', 'Hardware wallet', true),
          authTab('file', 'Key file')
        ),
        authMethod === 'mnemonic' && h(MnemonicAuth),
        authMethod === 'trezor' && h(HardwareAuth, {loadWallet}),
        authMethod === 'file' && h(KeyFileAuth)
      )
    return h(
      'div',
      {class: 'page-wrapper'},
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
      displayWelcome && h(Welcome),
      showDemoWalletWarningDialog && h(DemoWalletWarningDialog),
      showGenerateMnemonicDialog && h(GenerateMnemonicDialog),
      logoutNotificationOpen && h(LogoutNotification)
    )
  }
}

module.exports = connect(
  (state) => ({
    authMethod: state.authMethod,
    showDemoWalletWarningDialog: state.showDemoWalletWarningDialog,
    logoutNotificationOpen: state.logoutNotificationOpen,
    walletLoadingError: state.walletLoadingError,
    displayWelcome: state.displayWelcome,
    showGenerateMnemonicDialog: state.showGenerateMnemonicDialog,
  }),
  actions
)(LoginPage)
