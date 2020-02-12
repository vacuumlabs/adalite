import {h, Component} from 'preact'
import {connect} from '../../../helpers/connect'

import actions from '../../../actions'
import debugLog from '../../../helpers/debugLog'

import Tag from '../../common/tag'

const Hint = ({title, text, type}) => (
  <div className={`hint ${type}`}>
    <h3 className="hint-title">{title}</h3>
    <p className="hint-paragraph">{text}</p>
  </div>
)

interface Props {
  exportJsonWallet: (password: string, name: string) => void
}

interface State {
  walletName: string
  password: string
  confirmation: string
  passwordTouched: boolean
  confirmationTouched: boolean
  walletNameValid: boolean
  isPasswordValid: boolean
  showError: boolean
  errorMessage: string
  warningMessage: string
}

class ExportWalletDialog extends Component<Props, State> {
  constructor(props) {
    super(props)
    this.state = {
      walletName: '',
      password: '',
      confirmation: '',
      passwordTouched: false,
      confirmationTouched: false,
      walletNameValid: false,
      isPasswordValid: true,
      showError: false,
      errorMessage: '',
      warningMessage: '',
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
    return password === confirmation
  }

  getWarningMessage(password) {
    let warnMsg = ''
    if (password.trim().length < 8) {
      warnMsg = 'OPTIONAL - Password should be at least 8 characters long'
    }
    if (!/^.*[0-9]+.*$/.test(password)) {
      warnMsg = 'OPTIONAL - Password should contain at least one numerical digit'
    }
    if (!/^.*[A-Z]+.*$/.test(password)) {
      warnMsg = 'OPTIONAL - Password should contain at least one uppercase letter'
    }
    if (!/^.*[a-z]+.*$/.test(password)) {
      warnMsg = 'OPTIONAL - Password should contain at least one lowercase letter'
    }

    return warnMsg
  }

  updatePassword(e) {
    const passwordValid = this.isPasswordValid(e.target.value, this.state.confirmation)
    const secureWarningMsg = this.getWarningMessage(e.target.value)
    const passwordsTouched = this.state.passwordTouched && this.state.confirmationTouched
    this.setState({
      password: e.target.value,
      isPasswordValid: passwordValid,
      showError: passwordsTouched && !passwordValid,
      errorMessage: !passwordValid && 'Both passwords must match',
      warningMessage: secureWarningMsg,
    })
  }

  updateConfirmation(e) {
    const passwordValid = this.isPasswordValid(this.state.password, e.target.value)
    const passwordsTouched = this.state.passwordTouched && this.state.confirmationTouched
    this.setState({
      confirmation: e.target.value,
      isPasswordValid: passwordValid,
      showError: passwordsTouched && !passwordValid,
      errorMessage: !passwordValid && 'Both passwords must match',
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
    props,
    {
      confirmation,
      password,
      walletName,
      showError,
      isPasswordValid,
      errorMessage,
      warningMessage,
      walletNameValid,
    }
  ) {
    return (
      <div className="page-wrapper">
        <main className="page-main">
          <div className="export download card">
            <div className="export-content">
              <h2 className="export-title">
                Export Key File <span className="export-subtitle">(Encrypted JSON)</span>
              </h2>
              <input
                type="text"
                className="input fullwidth export"
                id="keyfile-name"
                name="keyfile-name"
                placeholder="Wallet name"
                value={walletName}
                onInput={this.updateWalletName}
                autoComplete="off"
              />
              <input
                type="password"
                className="input fullwidth export"
                id="keyfile-password"
                name="keyfile-password"
                placeholder="Choose a password (optional)"
                value={password}
                onInput={this.updatePassword}
                onBlur={this.touchPassword}
                autoComplete="off"
              />
              <input
                type="password"
                className="input fullwidth export"
                id="keyfile-password-confirmation"
                name="keyfile-password-confirmation"
                placeholder="Repeat the password"
                value={confirmation}
                onInput={this.updateConfirmation}
                onBlur={this.touchConfirmation}
                autoComplete="off"
              />
              {(showError || warningMessage.length > 0) && (
                <div className="validation-error-field">
                  {showError && <div className="validation-message error">{errorMessage}</div>}
                  {warningMessage.length > 0 && (
                    <div className="validation-message warning">{warningMessage}</div>
                  )}
                </div>
              )}
              <div className="export-content-bottom">
                <button className="button secondary" onClick={() => window.history.back()}>
                  Back
                </button>
                <button
                  className="button primary"
                  disabled={showError || !isPasswordValid || !walletNameValid}
                  onClick={this.exportJsonWallet}
                >
                  Download the key file
                </button>
              </div>
            </div>
            <Tag type="warning big" text="PROCEED WITH CAUTION" />
          </div>
        </main>
        <aside className="sidebar export">
          <Hint type="lose" title="Do not lose it" text="Key file cannot be recovered." />
          <Hint type="share" title="Do not Share it" text="Use it in the official AdaLite only." />
          <Hint
            type="backup"
            title="Make multiple backups"
            text="Store it safely in multiple places."
          />
        </aside>
      </div>
    )
  }
}

export default connect(
  undefined,
  actions
)(ExportWalletDialog)
