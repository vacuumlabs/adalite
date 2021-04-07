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

    setState({
      ...state,
      mnemonicAuthForm: {
        mnemonicInputValue,
        mnemonicInputError: null,
        formIsValid,
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

  return {
    updateMnemonic,
    updateMnemonicValidationError,
    openGenerateMnemonicDialog,
    closeGenerateMnemonicDialog,
  }
}
