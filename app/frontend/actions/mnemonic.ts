import {Store, State} from '../state'
import {AuthMethodType, TwelveWordDerivationMode} from '../types'
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
        twelveWordDerivation: 'legacy',
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
        twelveWordDerivation:
          words.length === 12 ? state.mnemonicAuthForm.twelveWordDerivation : 'legacy',
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

  const updateTwelveWordDerivation = (
    state: State,
    twelveWordDerivation: TwelveWordDerivationMode
  ) => {
    setState({
      ...state,
      mnemonicAuthForm: {
        ...state.mnemonicAuthForm,
        twelveWordDerivation,
      },
    })
  }

  return {
    updateMnemonic,
    updateMnemonicValidationError,
    updateTwelveWordDerivation,
    openGenerateMnemonicDialog,
    closeGenerateMnemonicDialog,
  }
}
