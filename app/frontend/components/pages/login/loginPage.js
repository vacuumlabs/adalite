const {h, Component} = require('preact')
const connect = require('unistore/preact').connect
const actions = require('../../../actions')
const {getTranslation} = require('../../../translations')

const AboutOverlay = require('./aboutOverlay')
const KeyFileAuth = require('./keyFileAuth')
const MnemonicAuth = require('./mnemonicAuth')
const HardwareAuth = require('./hardwareAuth')
const DemoWalletWarningDialog = require('./demoWalletWarningDialog')

class LoginPage extends Component {
  render({
    loadWallet,
    walletLoadingError,
    authMethod,
    setAuthMethod,
    enableTrezor,
    showDemoWalletWarningDialog,
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
        h('h1', {class: 'intro-header fade-in-up'}, 'Access Cardano Wallet via'),
        h(
          'ul',
          {class: 'tab-row'},
          authOption('mnemonic', 'Mnemonic'),
          authOption('trezor', 'Hardware wallet'),
          authOption('file', 'Key file')
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
      ),
      h(AboutOverlay),
      showDemoWalletWarningDialog && h(DemoWalletWarningDialog)
    )
  }
}

module.exports = connect(
  (state) => ({
    authMethod: state.authMethod,
    enableTrezor: state.enableTrezor,
    showDemoWalletWarningDialog: state.showDemoWalletWarningDialog,
    walletLoadingError: state.walletLoadingError,
  }),
  actions
)(LoginPage)
