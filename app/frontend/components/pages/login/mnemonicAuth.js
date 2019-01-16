const {h, Component} = require('preact')
const {getTranslation} = require('../../../translations')
const connect = require('unistore/preact').connect
const actions = require('../../../actions')

const Alert = require('../../common/alert')

class LoadByMenmonicSectionClass extends Component {
  componentDidMount() {
    !this.props.displayWelcome && this.mnemonicField.focus()
  }

  componentDidUpdate() {
    const shouldFormFocus =
      !this.props.mnemonic && !this.props.displayWelcome && !this.props.showDemoWalletWarningDialog
    shouldFormFocus && this.mnemonicField.focus()
  }

  render({
    mnemonic,
    mnemonicValidationError,
    updateMnemonic,
    checkForMnemonicValidationError,
    loadWallet,
    showMnemonicValidationError,
    showMnemonicInfoAlert,
  }) {
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
        'Enter the 12-word wallet mnemonic or 27-word Daedalus paper wallet mnemonic'
      ),
      h('input', {
        type: 'text',
        class: 'input fullwidth auth',
        id: 'mnemonic-submitted',
        name: 'mnemonic-submitted',
        placeholder: 'Enter your wallet mnemonic',
        value: mnemonic,
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
            disabled: !mnemonic || mnemonicValidationError,
            onClick: () => loadWallet({cryptoProvider: 'mnemonic', secret: mnemonic}),
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
      )
    )
  }
}

module.exports = connect(
  (state) => ({
    mnemonic: state.mnemonic,
    displayWelcome: state.displayWelcome,
    showDemoWalletWarningDialog: state.showDemoWalletWarningDialog,
    mnemonicValidationError: state.mnemonicValidationError,
    showMnemonicValidationError: state.showMnemonicValidationError,
    showMnemonicInfoAlert: state.showMnemonicInfoAlert,
  }),
  actions
)(LoadByMenmonicSectionClass)
