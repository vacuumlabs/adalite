const {h, Component} = require('preact')
const connect = require('unistore/preact').connect
const actions = require('../../../actions')
const {getTranslation} = require('../../../translations')

const AboutOverlay = require('./aboutOverlay')
const KeyFileAuth = require('./keyFileAuth')
const MnemonicAuth = require('./mnemonicAuth')
const HardwareAuth = require('./hardwareAuth')
const DemoWalletWarningDialog = require('./demoWalletWarningDialog')
const GenerateMnemonicDialog = require('./generateMnemonicDialog')
const LogoutNotification = require('./logoutNotification')

class LoginPage extends Component {
  render({
    loadWallet,
    walletLoadingError,
    authMethod,
    setAuthMethod,
    enableTrezor,
    showDemoWalletWarningDialog,
    logoutNotificationOpen,
    displayAboutOverlay,
    showGenerateMnemonicDialog,
  }) {
    const authTab = (name, text) =>
      h(
        'li',
        {
          class: `authentication-tab ${name} ${authMethod === name ? 'selected' : ''}`,
          onClick: () => setAuthMethod(name),
        },
        text
      )
    const authOption = (type, title, text, tag) =>
      h(
        'div',
        {class: `auth-option ${type}`, onClick: () => setAuthMethod(type)},
        tag && h('div', {class: `auth-option-tag ${tag}`}, tag),
        h('h3', {class: 'auth-option-title'}, title),
        h('p', {class: 'auth-option-text'}, text)
      )
    const authWrapperInitial = () =>
      h(
        'div',
        {class: 'authentication-wrapper initial'},
        h('h2', {class: 'authentication-title'}, 'How do you want to access\nyour Cardano Wallet?'),
        h(
          'div',
          {class: 'auth-options'},
          authOption('mnemonic', 'Mnemonic', '12 or 27 word passphrase', 'fastest'),
          authOption('trezor', 'Hardware Wallet', 'Supporting Trezor T', 'recommended'),
          authOption('file', 'Key file', 'Encrypted .JSON file')
        )
      )
    /* TODO: implement selected auth method content */
    const authWrapperSelected = () =>
      h(
        'div',
        {class: 'authentication-wrapper'},
        h(
          'ul',
          {class: 'authentication-tabs'},
          authTab('mnemonic', 'Mnemonic'),
          authTab('trezor', 'Hardware wallet'),
          authTab('file', 'Key file')
        ),
        walletLoadingError &&
          h(
            'p',
            {class: 'alert error'},
            getTranslation(walletLoadingError.code, walletLoadingError.params)
          ),
        authMethod === 'mnemonic' && h(MnemonicAuth),
        authMethod === 'trezor' && h(HardwareAuth, {enableTrezor, loadWallet}),
        authMethod === 'file' && h(KeyFileAuth)
      )
    return h(
      'div',
      {class: 'page-wrapper'},
      h(
        'main',
        {class: 'page-main'},
        h(
          'div',
          {class: 'authentication card'},
          authMethod === '' ? h(authWrapperInitial) : h(authWrapperSelected)
        )
      ),
      /* TODO: replace with the loginPageSidebar component */
      h('aside', undefined, undefined),
      displayAboutOverlay && h(AboutOverlay),
      showDemoWalletWarningDialog && h(DemoWalletWarningDialog),
      showGenerateMnemonicDialog && h(GenerateMnemonicDialog),
      logoutNotificationOpen && h(LogoutNotification)
    )
  }
}

module.exports = connect(
  (state) => ({
    authMethod: state.authMethod,
    enableTrezor: state.enableTrezor,
    showDemoWalletWarningDialog: state.showDemoWalletWarningDialog,
    logoutNotificationOpen: state.logoutNotificationOpen,
    walletLoadingError: state.walletLoadingError,
    displayAboutOverlay: state.displayAboutOverlay,
    showGenerateMnemonicDialog: state.showGenerateMnemonicDialog,
  }),
  actions
)(LoginPage)
