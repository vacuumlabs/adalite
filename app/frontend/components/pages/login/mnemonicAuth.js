const {h, Component} = require('preact')
const {getTranslation} = require('../../../translations')
const connect = require('unistore/preact').connect
const actions = require('../../../actions')
const mnemonicToWalletSecretDef = require('../../../wallet/helpers/mnemonicToWalletSecretDef')
const {CRYPTO_PROVIDER_TYPES} = require('../../../wallet/constants')
const tooltip = require('../../common/tooltip')
const Alert = require('../../common/alert')
const sanitizeMnemonic = require('../../../helpers/sanitizeMnemonic')
const ADALITE_DEMO_WALLET_MNEMONIC = require('../../../config').ADALITE_CONFIG
  .ADALITE_DEMO_WALLET_MNEMONIC

class LoadByMenmonicSectionClass extends Component {
  componentDidUpdate() {
    const shouldFormFocus =
      !this.props.mnemonic && !this.props.displayWelcome && !this.props.showDemoWalletWarningDialog
    shouldFormFocus && this.mnemonicField.focus()
  }

  // meant only for development in order to speed up the process of unlocking wallet
  async autoLogin() {
    const sanitizedMnemonic = sanitizeMnemonic(ADALITE_DEMO_WALLET_MNEMONIC)
    await this.props.loadWallet({
      cryptoProviderType: CRYPTO_PROVIDER_TYPES.WALLET_SECRET,
      walletSecretDef: await mnemonicToWalletSecretDef(sanitizedMnemonic),
    })
  }

  componentDidMount() {
    if (this.props.autoLogin) {
      this.autoLogin()
    }
  }

  render({
    mnemonicInputValue,
    mnemonicValidationError,
    updateMnemonic,
    checkForMnemonicValidationError,
    loadWallet,
    showMnemonicValidationError,
    showMnemonicInfoAlert,
    openGenerateMnemonicDialog,
  }) {
    const sanitizedMnemonic = sanitizeMnemonic(mnemonicInputValue)

    return h(
      'div',
      {class: `authentication-content ${showMnemonicInfoAlert ? '' : 'centered'}`},
      showMnemonicInfoAlert &&
        h(
          Alert,
          {alertType: 'info auth'},
          'Here you can use your mnemonic to access your new wallet.'
        ),
      h(
        'label',
        {
          class: 'authentication-label',
          for: 'mnemonic-submitted',
        },
        'Enter the 12 or 15-word wallet mnemonic or 27-word Daedalus-type paper wallet mnemonic'
      ),
      h('input', {
        type: 'text',
        class: 'input fullwidth auth',
        id: 'mnemonic-submitted',
        name: 'mnemonic-submitted',
        placeholder: 'Enter your wallet mnemonic',
        value: mnemonicInputValue,
        onInput: updateMnemonic,
        onBlur: checkForMnemonicValidationError,
        autocomplete: 'off',
        ref: (element) => {
          this.mnemonicField = element
        },
        onKeyDown: (e) => e.key === 'Enter' && this.goBtn.click(),
      }),
      h(
        'div',
        {class: 'validation-row'},
        h(
          'button',
          {
            class: 'button primary',
            disabled: !sanitizedMnemonic || mnemonicValidationError,
            onClick: async () =>
              loadWallet({
                cryptoProviderType: CRYPTO_PROVIDER_TYPES.WALLET_SECRET,
                walletSecretDef: await mnemonicToWalletSecretDef(sanitizedMnemonic),
              }),
            ...tooltip(
              'Your input appears to be incorrect.\nCheck for the typos and try again.',
              showMnemonicValidationError && sanitizedMnemonic && mnemonicValidationError
            ),
            onKeyDown: (e) => {
              e.key === 'Enter' && e.target.click()
              if (e.key === 'Tab') {
                this.mnemonicField.focus()
                e.preventDefault()
              }
            },
            ref: (element) => {
              this.goBtn = element
            },
          },
          'Unlock'
        ),
        mnemonicValidationError &&
          showMnemonicValidationError &&
          h(
            'div',
            {class: 'validation-message error'},
            getTranslation(mnemonicValidationError.code)
          )
      ),
      h(
        'a',
        {
          class: 'authentication-link',
          onClick: (e) => {
            e.preventDefault()
            openGenerateMnemonicDialog()
          },
        },
        'Create New Wallet'
      )
    )
  }
}

module.exports = connect(
  (state) => ({
    mnemonicInputValue: state.mnemonicInputValue,
    displayWelcome: state.displayWelcome,
    showDemoWalletWarningDialog: state.showDemoWalletWarningDialog,
    mnemonicValidationError: state.mnemonicValidationError,
    showMnemonicValidationError: state.showMnemonicValidationError,
    showMnemonicInfoAlert: state.showMnemonicInfoAlert,
    autoLogin: state.autoLogin,
  }),
  actions
)(LoadByMenmonicSectionClass)
