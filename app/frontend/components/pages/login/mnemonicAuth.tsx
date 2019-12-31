import {h, Component} from 'preact'
import {getTranslation} from '../../../translations'
import {connect} from '../../../helpers/connect'
import actions from '../../../actions'
import mnemonicToWalletSecretDef from '../../../wallet/helpers/mnemonicToWalletSecretDef'
import {CRYPTO_PROVIDER_TYPES} from '../../../wallet/constants'
import tooltip from '../../common/tooltip'
import Alert from '../../common/alert'
import sanitizeMnemonic from '../../../helpers/sanitizeMnemonic'
import {ADALITE_CONFIG} from '../../../config'
import testnetActions from '../../../testnet/testnet-actions'

const {ADALITE_DEMO_WALLET_MNEMONIC} = ADALITE_CONFIG

interface Props {
  formData?: any
  updateMnemonic?: (e: any) => void
  updateMnemonicValidationError?: () => void
  //
  loadWallet: any
  showMnemonicInfoAlert?: boolean
  openGenerateMnemonicDialog?: () => void
  autoLogin?: boolean
  displayWelcome?: boolean
  showDemoWalletWarningDialog?: boolean
}

class LoadByMnemonicSectionClass extends Component<Props> {
  mnemonicField: HTMLInputElement
  goBtn: HTMLButtonElement

  componentDidUpdate() {
    const shouldFormFocus =
      !this.props.formData.mnemonicInputValue &&
      !this.props.displayWelcome &&
      !this.props.showDemoWalletWarningDialog
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
    formData,
    updateMnemonic,
    updateMnemonicValidationError,
    loadWallet,
    showMnemonicInfoAlert,
    openGenerateMnemonicDialog,
  }) {
    const sanitizedMnemonic = sanitizeMnemonic(formData.mnemonicInputValue)

    return (
      <div className={`authentication-content ${showMnemonicInfoAlert ? '' : 'centered'}`}>
        {showMnemonicInfoAlert && (
          <Alert alertType="info auth">
            Here you can use your mnemonic to access your new wallet.
          </Alert>
        )}
        <label className="authentication-label" htmlFor="mnemonic-submitted">
          Enter the 12 or 15-word wallet mnemonic or 27-word Daedalus-type paper wallet mnemonic
        </label>
        <input
          type="text"
          className="input fullwidth auth"
          id="mnemonic-submitted"
          name="mnemonic-submitted"
          placeholder="Enter your wallet mnemonic"
          value={formData.mnemonicInputValue}
          onInput={updateMnemonic}
          onBlur={updateMnemonicValidationError}
          autoComplete="off"
          ref={(element) => {
            this.mnemonicField = element
          }}
          onKeyDown={(e) => e.key === 'Enter' && this.goBtn.click()}
        />
        <div className="validation-row">
          <button
            className="button primary"
            // disabled={!formData.formIsValid}
            onClick={async () =>
              loadWallet({
                cryptoProviderType: CRYPTO_PROVIDER_TYPES.WALLET_SECRET,
                // TODO(ppershing): get rid of mnemonic sanitization in this component
                walletSecretDef: await mnemonicToWalletSecretDef(sanitizedMnemonic),
              })
            }
            {...tooltip(
              'Your input appears to be incorrect.\nCheck for the typos and try again.',
              formData.mnemonicInputError
            )}
            onKeyDown={(e) => {
              e.key === 'Enter' && (e.target as HTMLButtonElement).click()
              if (e.key === 'Tab') {
                this.mnemonicField.focus()
                e.preventDefault()
              }
            }}
            ref={(element) => {
              this.goBtn = element
            }}
          >
            Unlock
          </button>
          {formData.mnemonicInputError && (
            <div className="validation-message error">
              {getTranslation(formData.mnemonicInputError.code)}
            </div>
          )}
        </div>
        <a
          className="authentication-link"
          onClick={(e) => {
            e.preventDefault()
            openGenerateMnemonicDialog()
          }}
        >
          Create New Wallet
        </a>
      </div>
    )
  }
}

export default connect(
  (state) => ({
    formData: state.mnemonicAuthForm,
    displayWelcome: state.displayWelcome,
    showDemoWalletWarningDialog: state.showDemoWalletWarningDialog,
    showMnemonicInfoAlert: state.showMnemonicInfoAlert,
    autoLogin: state.autoLogin,
  }),
  testnetActions
)(LoadByMnemonicSectionClass)
