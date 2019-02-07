const {h, Component} = require('preact')
const connect = require('unistore/preact').connect
const actions = require('../../../actions')
const {getTranslation} = require('../../../translations')

const AboutOverlay = require('./aboutOverlay')
const KeyFileAuth = require('./keyFileAuth')
const MnemonicAuth = require('./mnemonicAuth')
const HardwareAuth = require('./hardwareAuth')
const DemoWalletWarningDialog = require('./demoWalletWarningDialog')
const LogoutNotification = require('./logoutNotification')

class LoginPage extends Component {
  render({
    loadWallet,
    walletLoadingError,
    authMethod,
    setAuthMethod,
    showDemoWalletWarningDialog,
    logoutNotificationOpen,
    displayAboutOverlay,
  }) {
    const authOption = (name, text) =>
      h(
        'li',
        {
          class: authMethod === name && 'selected',
          onClick: () => setAuthMethod(name),
        },
        text
      )
    return h(
      'div',
      {class: 'intro-wrapper'},
      h(
        'div',
        undefined,
        h('h2', {class: 'intro-header'}, 'Access Cardano Wallet via'),
        h(
          'ul',
          {class: 'tab-row'},
          authOption('mnemonic', 'Mnemonic'),
          authOption('hw-wallet', 'Hardware wallet'),
          authOption('file', 'Key file')
        ),
        walletLoadingError &&
          h(
            'p',
            {class: 'alert error'},
            getTranslation(walletLoadingError.code, walletLoadingError.params)
          ),
        authMethod === 'mnemonic' && h(MnemonicAuth),
        authMethod === 'hw-wallet' && h(HardwareAuth, {loadWallet}),
        authMethod === 'file' && h(KeyFileAuth)
      ),
      displayAboutOverlay && h(AboutOverlay),
      showDemoWalletWarningDialog && h(DemoWalletWarningDialog),
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
    displayAboutOverlay: state.displayAboutOverlay,
  }),
  actions
)(LoginPage)
