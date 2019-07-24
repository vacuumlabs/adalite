const {h, Component} = require('preact')
const connect = require('unistore/preact').connect

const actions = require('../../../actions')
const debugLog = require('../../../helpers/debugLog')

const Tag = require('../../common/tag')

const Hint = ({title, text, type}) =>
  h(
    'div',
    {class: `hint ${type}`},
    h('h3', {class: 'hint-title'}, title),
    h('p', {class: 'hint-paragraph'}, text)
  )

class ExportWalletDialog extends Component {
  constructor(props) {
    super(props)
    this.state = {
      walletName: '',
      password: '',
      confirmation: '',
      passwordTouched: false,
      confirmationTouched: false,
      walletNameValid: false,
      isPasswordValid: false,
      showError: false,
      errorMessage: '',
    }

    this.updateWalletName = this.updateWalletName.bind(this)
    this.updatePassword = this.updatePassword.bind(this)
    this.updateConfirmation = this.updateConfirmation.bind(this)
    this.exportJsonWallet = this.exportJsonWallet.bind(this)
    this.touchConfirmation = this.touchConfirmation.bind(this)
    this.touchPassword = this.touchPassword.bind(this)
  }

  exportJsonWallet(e) {
    try {
      this.props.exportJsonWallet(this.state.password, this.state.walletName)
      this.setState({password: '', confirmation: ''})
    } catch (exception) {
      this.setState({showError: true, errorMessage: 'Wallet export failed.'})
      debugLog(e)
    }
    setTimeout(
      () => this.state.showError && this.setState({showError: false, errorMessage: ''}),
      3000
    )
  }

  isPasswordValid(password, confirmation) {
    return password === confirmation && password.trim().length
  }

  updatePassword(e) {
    const passwordValid = this.isPasswordValid(e.target.value, this.state.confirmation)
    const passwordsTouched = this.state.passwordTouched && this.state.confirmationTouched
    this.setState({
      password: e.target.value,
      isPasswordValid: passwordValid,
      showError: passwordsTouched && !passwordValid,
      errorMessage: passwordsTouched && !passwordValid && 'Both passwords must match',
    })
  }

  updateConfirmation(e) {
    const passwordValid = this.isPasswordValid(this.state.password, e.target.value)
    const passwordsTouched = this.state.passwordTouched && this.state.confirmationTouched
    this.setState({
      confirmation: e.target.value,
      isPasswordValid: passwordValid,
      showError: passwordsTouched && !passwordValid,
      errorMessage: passwordsTouched && !passwordValid && 'Both passwords must match',
    })
  }

  updateWalletName(e) {
    const walletName = e.target.value
    const walletNameValid = /^[a-zA-Z0-9-_]+$/.test(e.target.value)
    this.setState({
      walletName,
      walletNameValid,
      showError: !walletNameValid && walletName !== '',
      errorMessage:
        !walletNameValid &&
        walletName !== '' &&
        'Allowed characters for wallet name are only a-z, A-Z, 0-9, -, _',
    })
  }

  touchPassword() {
    this.setState({passwordTouched: true})
  }

  touchConfirmation() {
    this.setState({confirmationTouched: true})
  }

  render(
    {_},
    {confirmation, password, walletName, showError, isPasswordValid, errorMessage, walletNameValid}
  ) {
    return h(
      'div',
      {class: 'page-wrapper'},
      h(
        'div',
        {class: 'page-inner'},
        h(
          'main',
          {class: 'page-main'},
          h(
            'div',
            {class: 'export download card'},
            h(
              'div',
              {class: 'export-content-bottom'},
              h(
                'button',
                {
                  class: 'button secondary',
                  onClick: () => window.history.back(),
                },
                'Back'
              ),
              h(
                'h2',
                {class: 'export-title'},
                'Export Key File ',
                h('span', {class: 'export-subtitle'}, '(Encrypted JSON)')
              ),
              h('input', {
                type: 'text',
                class: 'input fullwidth export',
                id: 'keyfile-name',
                name: 'keyfile-name',
                placeholder: 'Wallet name',
                value: walletName,
                onInput: this.updateWalletName,
                autocomplete: 'off',
              }),
              h('input', {
                type: 'password',
                class: 'input fullwidth export',
                id: 'keyfile-password',
                name: 'keyfile-password',
                placeholder: 'Choose a password',
                value: password,
                onInput: this.updatePassword,
                onBlur: this.touchPassword,
                autocomplete: 'off',
              }),
              h('input', {
                type: 'password',
                class: 'input fullwidth export',
                id: 'keyfile-password-confirmation',
                name: 'keyfile-password-confirmation',
                placeholder: 'Repeat the password',
                value: confirmation,
                onInput: this.updateConfirmation,
                onBlur: this.touchConfirmation,
                autocomplete: 'off',
              }),
              h(
                'div',
                {class: 'validation-row'},
                h(
                  'button',
                  {
                    class: 'button primary',
                    disabled: showError || !isPasswordValid || !walletNameValid,
                    onClick: this.exportJsonWallet,
                  },
                  'Download the key file'
                ),
                showError && h('div', {class: 'validation-message error'}, errorMessage)
              )
            ),
            h(Tag, {type: 'warning big', text: 'PROCEED WITH CAUTION'})
          )
        ),
        h(
          'aside',
          {class: 'sidebar export'},
          h(Hint, {
            type: 'lose',
            title: 'Do not lose it',
            text: 'Key file cannot be recovered.',
          }),
          h(Hint, {
            type: 'share',
            title: 'Do not Share it',
            text: 'Use it in the official AdaLite only.',
          }),
          h(Hint, {
            type: 'backup',
            title: 'Make multiple backups',
            text: 'Store it safely in multiple places.',
          })
        )
      )
    )
  }
}

module.exports = connect(
  undefined,
  actions
)(ExportWalletDialog)
