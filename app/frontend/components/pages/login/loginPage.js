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
    mnemonic,
    mnemonicValidationError,
    loadWallet,
    walletLoadingError,
    loadDemoWallet,
    updateMnemonic,
    authMethod,
    openGenerateMnemonicDialog,
    showMnemonicValidationError,
    showGenerateMnemonicDialog,
    checkForMnemonicValidationError,
    setAuthMethod,
    showDemoWalletWarningDialog,
    enableTrezor,
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
        authMethod === 'mnemonic' &&
          MnemonicAuth({
            mnemonic,
            mnemonicValidationError,
            updateMnemonic,
            checkForMnemonicValidationError,
            loadWallet,
            openGenerateMnemonicDialog,
            showGenerateMnemonicDialog,
            loadDemoWallet,
            showMnemonicValidationError,
          }),
        authMethod === 'trezor' && HardwareAuth({enableTrezor, loadWallet}),
        authMethod === 'file' && h(KeyFileAuth)
      ),
      h(AboutOverlay),
      showDemoWalletWarningDialog && h(DemoWalletWarningDialog)
    )
  }
}

module.exports = connect(
  (state) => ({
    mnemonic: state.mnemonic,
    mnemonicValidationError: state.mnemonicValidationError,
    showDemoWalletWarningDialog: state.showDemoWalletWarningDialog,
    showMnemonicValidationError: state.showMnemonicValidationError,
    showGenerateMnemonicDialog: state.showGenerateMnemonicDialog,
    walletLoadingError: state.walletLoadingError,
    authMethod: state.authMethod,
    enableTrezor: state.enableTrezor,
  }),
  actions
)(LoginPage)
