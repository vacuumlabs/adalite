const {h, Component} = require('preact')
const connect = require('unistore/preact').connect

const actions = require('../../../actions')
const debugLog = require('../../../helpers/debugLog')

class ExportWalletDialog extends Component {
  constructor(props) {
    super(props)
    this.state = {
      walletName: 'Cardano_lite',
      isWalletNameValid: true,
      password: '',
      confirmation: '',
      isPasswordDirty: false,
      isPasswordConfirmationDirty: false,
      showError: false,
    }

    this.updateWalletName = this.updateWalletName.bind(this)
    this.updatePassword = this.updatePassword.bind(this)
    this.updatePasswordConfirmation = this.updatePasswordConfirmation.bind(this)
    this.exportJsonWallet = this.exportJsonWallet.bind(this)
    this.touchPasswordConfirmationField = this.touchPasswordConfirmationField.bind(this)
    this.touchPasswordField = this.touchPasswordField.bind(this)
  }

  componentDidMount() {
    this.walletNameField.focus()
  }

  exportJsonWallet(e) {
    try {
      this.props.exportJsonWallet(this.state.password, this.state.walletName)
      this.setState({password: '', confirmation: ''})
      this.walletNameField.focus()
    } catch (exception) {
      this.setState({showError: true})
      debugLog(e)
    }
    setTimeout(() => this.state.showError && this.setState({showError: false}), 3000)
  }

  isPasswordValid(password, confirmation) {
    if (password !== confirmation || !password.trim().length) {
      return false
    } else {
      return true
    }
  }

  updatePassword(e) {
    this.setState({
      password: e.target.value,
      isPasswordValid: this.isPasswordValid(e.target.value, this.state.confirmation),
    })
  }

  updatePasswordConfirmation(e) {
    this.setState({
      confirmation: e.target.value,
      isPasswordValid: this.isPasswordValid(this.state.password, e.target.value),
    })
  }

  updateWalletName(e) {
    this.setState({
      walletName: e.target.value,
      isWalletNameValid: /^[a-zA-Z0-9-_]+$/.test(e.target.value),
    })
  }

  touchPasswordField() {
    this.setState({isPasswordDirty: true})
  }

  touchPasswordConfirmationField() {
    this.setState({isPasswordConfirmationDirty: true})
  }

  render(
    {_},
    {
      confirmation,
      password,
      walletName,
      isPasswordValid,
      isPasswordDirty,
      isPasswordConfirmationDirty,
      isWalletNameValid,
      showError,
    }
  ) {
    return h(
      'div',
      {class: 'content-wrapper'},
      h(
        'div',
        {class: 'margin-2rem'},
        h('h2', undefined, 'Export wallet to JSON file:'),
        showError && h('div', {class: 'alert error'}, 'Wallet export failed'),
        h(
          'div',
          {class: 'row'},
          h('label', {for: 'keyfile-name'}, h('span', undefined, 'Choose wallet name:'))
        ),
        h('input', {
          type: 'text',
          class: 'styled-input-nodiv',
          id: 'keyfile-name',
          name: 'keyfile-name',
          placeholder: 'cardano_lite_wallet',
          value: walletName,
          onInput: this.updateWalletName,
          onBlur: this.touchPasswordField,
          autocomplete: 'off',
          ref: (element) => {
            this.walletNameField = element
          },
        }),
        h(
          'div',
          {class: 'row margin-top'},
          h('label', {for: 'keyfile-password'}, h('span', undefined, 'Password:'))
        ),
        h('input', {
          type: 'password',
          class: 'styled-input-nodiv',
          id: 'keyfile-password',
          name: 'keyfile-password',
          placeholder: 'Enter password',
          value: password,
          onInput: this.updatePassword,
          onBlur: this.touchPasswordField,
          autocomplete: 'new-password',
        }),
        h(
          'div',
          {class: 'row margin-top'},
          h(
            'label',
            {for: 'keyfile-password-confirmation'},
            h('span', undefined, 'Password confirmation:')
          )
        ),
        h('input', {
          type: 'password',
          class: 'styled-input-nodiv',
          id: 'keyfile-password-confirmation',
          name: 'keyfile-password-confirmation',
          placeholder: 'Enter password confirmation',
          value: confirmation,
          onInput: this.updatePasswordConfirmation,
          onBlur: this.touchPasswordConfirmationField,
          autocomplete: 'new-password',
        }),
        h(
          'p',
          {
            class: `validationMsg margin-top center ${
              (!isPasswordValid && isPasswordDirty && isPasswordConfirmationDirty) ||
              !isWalletNameValid
                ? ''
                : 'hidden'
            }`,
          },
          !isWalletNameValid
            ? 'Allowed characters for wallet name are only a-z, A-Z, 0-9, -, _'
            : 'Password must match and cannot be empty'
        ),
        h(
          'button',
          {
            disabled: !this.isPasswordValid(password, confirmation) || !isWalletNameValid,
            onClick: this.exportJsonWallet,
            onKeyDown: (e) => {
              if (e.key === 'Tab') {
                this.walletNameField.focus()
                e.preventDefault()
              }
            },
            class: 'button-like submit-button',
          },
          'Export'
        )
      )
    )
  }
}

module.exports = connect(
  undefined,
  actions
)(ExportWalletDialog)
