import {h, Component} from 'preact'
import {connect} from '../../../helpers/connect'
import actions from '../../../actions'
import {underlineNonBip39words} from '../../../helpers/dynamicTextFormatter'
import {getCaretPosition, setCaretPosition} from '../../../../frontend/helpers/caretPosition'

interface Props {
  formData: any
  updateMnemonic: (mnemonic) => void
  updateMnemonicValidationError: () => void
  onEnterKeyDown: (e) => void
  onTabKeyDown: (e) => void
  expose
}

class MnemonicField extends Component<Props> {
  mnemonicField: HTMLDivElement
  lastFormattedMnemonic = ''
  lastRawMnemonic = ''

  state = {
    focus: 'focus',
  }

  constructor(props) {
    super()
    props.expose.focus = () => this.mnemonicField && this.mnemonicField.focus()
  }

  updateMnemonic() {
    if (this.lastFormattedMnemonic !== this.mnemonicField.innerHTML) {
      const {formattedText, rawText} = underlineNonBip39words(this.mnemonicField.innerHTML)

      const caretPosition = getCaretPosition(this.mnemonicField)
      this.mnemonicField.innerHTML = `${formattedText}`
      setCaretPosition(this.mnemonicField, caretPosition)

      this.lastFormattedMnemonic = formattedText
      this.lastRawMnemonic = rawText
      this.props.updateMnemonic(rawText)
    }
  }

  overwriteMnemonic() {
    this.mnemonicField.innerHTML = this.props.formData.mnemonicInputValue
    this.updateMnemonic()
    setCaretPosition(this.mnemonicField, this.props.formData.mnemonicInputValue.length)
  }

  componentDidMount() {
    this.overwriteMnemonic()
  }

  componentDidUpdate() {
    if (this.props.formData.mnemonicInputValue !== this.lastRawMnemonic) {
      this.overwriteMnemonic()
    }
  }

  render({formData, updateMnemonicValidationError, onEnterKeyDown, onTabKeyDown}) {
    return (
      <div className={`input fullwidth auth ${this.state.focus}`}>
        <div
          contentEditable
          // eslint-disable-next-line react/no-unknown-property
          spellcheck={false}
          tabIndex={0}
          type="text"
          className={`mnemonic-text-field ${
            formData.mnemonicInputValue.length ? '' : 'mnemonic-placeholder'
          }`}
          onInput={() => this.updateMnemonic()}
          onBlur={() => {
            this.setState({focus: ''})
            updateMnemonicValidationError()
          }}
          autoComplete="off"
          ref={(element) => {
            this.mnemonicField = element
          }}
          onKeyDown={(e) => {
            e.key === 'Enter' && onEnterKeyDown(e)
            e.key === 'Tab' && onTabKeyDown(e)
          }}
          onFocus={() => this.setState({focus: 'focus'})}
        />
      </div>
    )
  }
}

export default connect(
  (state) => ({
    formData: state.mnemonicAuthForm,
  }),
  actions
)(MnemonicField)
