import {h} from 'preact'
import {getErrorMessage} from '../../../errors'
import {useSelector, useActions} from '../../../helpers/connect'
import actions from '../../../actions'
import mnemonicToWalletSecretDef from '../../../wallet/helpers/mnemonicToWalletSecretDef'
import {CryptoProviderType} from '../../../wallet/types'
import tooltip from '../../common/tooltip'
import Alert from '../../common/alert'
import sanitizeMnemonic from '../../../helpers/sanitizeMnemonic'
import {ADALITE_CONFIG} from '../../../config'
import {useEffect, useRef} from 'preact/hooks'

const {ADALITE_DEMO_WALLET_MNEMONIC} = ADALITE_CONFIG

const MnemonicAuth = (): h.JSX.Element => {
  const {
    formData,
    shouldShowMnemonicInfoAlert,
    autoLogin,
    displayWelcome,
    shouldShowDemoWalletWarningDialog,
  } = useSelector((state) => ({
    formData: state.mnemonicAuthForm,
    displayWelcome: state.displayWelcome,
    shouldShowDemoWalletWarningDialog: state.shouldShowDemoWalletWarningDialog,
    shouldShowMnemonicInfoAlert: state.shouldShowMnemonicInfoAlert,
    autoLogin: state.autoLogin,
  }))
  const {
    updateMnemonic,
    updateMnemonicValidationError,
    loadWallet,
    openGenerateMnemonicDialog,
  } = useActions(actions)

  const mnemonicField = useRef<HTMLInputElement>(null)
  const goBtn = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (!formData.mnemonicInputValue && !displayWelcome && !shouldShowDemoWalletWarningDialog) {
      mnemonicField.current.focus()
    }
  }, [formData.mnemonicInputValue, displayWelcome, shouldShowDemoWalletWarningDialog])

  useEffect(() => {
    // meant only for development in order to speed up the process of unlocking wallet
    async function autoDemoLogin() {
      const sanitizedMnemonic = sanitizeMnemonic(ADALITE_DEMO_WALLET_MNEMONIC)
      await loadWallet({
        cryptoProviderType: CryptoProviderType.WALLET_SECRET,
        walletSecretDef: await mnemonicToWalletSecretDef(sanitizedMnemonic),
        shouldExportPubKeyBulk: true,
      })
    }
    if (autoLogin) {
      autoDemoLogin()
    }
  }, [autoLogin, loadWallet])

  const sanitizedMnemonic = sanitizeMnemonic(formData.mnemonicInputValue)

  return (
    <div className={`authentication-content ${shouldShowMnemonicInfoAlert ? '' : 'centered'}`}>
      {shouldShowMnemonicInfoAlert && (
        <Alert alertType="info auth">
          Here you can use your mnemonic to access your new wallet.
        </Alert>
      )}
      <label className="authentication-label" htmlFor="mnemonic-submitted">
        Enter the 12, 15, 24 or 27-word wallet mnemonic seed phrase
      </label>
      <input
        type="text"
        className="input fullwidth auth"
        id="mnemonic-submitted"
        name="mnemonic-submitted"
        data-cy="MnemonicTextField"
        placeholder="Enter your wallet mnemonic"
        value={formData.mnemonicInputValue}
        onInput={updateMnemonic}
        onBlur={updateMnemonicValidationError}
        autoComplete="off"
        ref={mnemonicField}
        onKeyDown={(e) => e.key === 'Enter' && goBtn?.current.click()}
      />
      <div className="validation-row">
        <button
          className="button primary"
          disabled={!formData.formIsValid}
          onClick={async () =>
            loadWallet({
              cryptoProviderType: CryptoProviderType.WALLET_SECRET,
              // TODO(ppershing): get rid of mnemonic sanitization in this component
              walletSecretDef: await mnemonicToWalletSecretDef(sanitizedMnemonic),
              shouldExportPubKeyBulk: true,
            })
          }
          {...tooltip(
            'Your input appears to be incorrect.\nCheck for the typos and try again.',
            formData.mnemonicInputError
          )}
          onKeyDown={(e) => {
            // TODO: currently, if you press Enter, this gets fired multiple times,
            // resulting in AccountExplorationError
            e.key === 'Enter' && (e.target as HTMLButtonElement).click()
            if (e.key === 'Tab') {
              mnemonicField.current.focus()
              e.preventDefault()
            }
          }}
          ref={goBtn}
        >
          Unlock
        </button>
        {formData.mnemonicInputError && (
          <div className="validation-message error">
            {getErrorMessage(formData.mnemonicInputError.code)}
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

export default MnemonicAuth
