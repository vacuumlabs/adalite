import {Store, State} from '../state'
import {AuthMethodType} from '../types'
import sanitizeMnemonic from '../helpers/sanitizeMnemonic'
import {mnemonicValidator} from '../helpers/validators'

export default (store: Store) => {
  const {setState} = store

  const openGenerateMnemonicDialog = (state) => {
    setState({
      mnemonicAuthForm: {
        mnemonicInputValue: '',
        mnemonicInputError: null,
        formIsValid: false,
        useExodusDerivationPath: false,
      },
      shouldShowGenerateMnemonicDialog: true,
      authMethod: AuthMethodType.MNEMONIC,
      shouldShowMnemonicInfoAlert: true,
    })
  }

  const closeGenerateMnemonicDialog = (state) => {
    setState({
      shouldShowGenerateMnemonicDialog: false,
    })
  }

  const updateMnemonic = (state: State, e) => {
    const mnemonicInputValue = e.target.value
    const sanitizedMnemonic = sanitizeMnemonic(mnemonicInputValue)
    const formIsValid = sanitizedMnemonic && mnemonicValidator(sanitizedMnemonic) === null
    const words = sanitizedMnemonic ? sanitizedMnemonic.split(' ') : []

    setState({
      ...state,
      mnemonicAuthForm: {
        mnemonicInputValue,
        mnemonicInputError: null,
        formIsValid,
        useExodusDerivationPath:
          words.length === 12 ? state.mnemonicAuthForm.useExodusDerivationPath : false,
      },
    })
  }

  const updateMnemonicValidationError = (state: State) => {
    setState({
      ...state,
      mnemonicAuthForm: {
        ...state.mnemonicAuthForm,
        mnemonicInputError: mnemonicValidator(
          sanitizeMnemonic(state.mnemonicAuthForm.mnemonicInputValue)
        ),
      },
    })
  }

  const updateUseExodusDerivationPath = (state: State, e) => {
    setState({
      ...state,
      mnemonicAuthForm: {
        ...state.mnemonicAuthForm,
        useExodusDerivationPath: !!e.target.checked,
      },
    })
  }

  return {
    updateMnemonic,
    updateMnemonicValidationError,
    updateUseExodusDerivationPath,
    openGenerateMnemonicDialog,
    closeGenerateMnemonicDialog,
  }
}
