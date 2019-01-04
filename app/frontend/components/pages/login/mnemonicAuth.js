const {h, Component} = require('preact')
const {getTranslation} = require('../../../translations')
const connect = require('unistore/preact').connect
const actions = require('../../../actions')
const isLeftClick = require('../../../helpers/isLeftClick')

class LoadByMenmonicSectionClass extends Component {
  componentDidMount() {
    !this.props.displayAboutOverlay && this.mnemonicField.focus()
  }

  componentDidUpdate() {
    const shouldFormFocus =
      !this.props.mnemonic &&
      !this.props.displayAboutOverlay &&
      !this.props.showDemoWalletWarningDialog
    shouldFormFocus && this.mnemonicField.focus()
  }

  render({
    mnemonic,
    mnemonicValidationError,
    updateMnemonic,
    checkForMnemonicValidationError,
    loadWallet,
    loadDemoWallet,
    showMnemonicValidationError,
  }) {
    return h(
      'div',
      {class: 'authentication-content'},
      h(
        'div',
        {class: 'centered-row margin-bottom'},
        'Enter the 12-word wallet mnemonic or 27-word Daedalus paper wallet mnemonic'
      ),
      mnemonicValidationError &&
        showMnemonicValidationError &&
        h('p', {class: 'alert error'}, getTranslation(mnemonicValidationError.code)),
      h(
        'div',
        {class: 'intro-input-row'},
        h('input', {
          type: 'text',
          class: 'input',
          id: 'mnemonic-submitted',
          name: 'mnemonic-submitted',
          placeholder: 'Enter wallet mnemonic',
          value: mnemonic,
          onInput: updateMnemonic,
          onBlur: checkForMnemonicValidationError,
          autocomplete: 'nope',
          ref: (element) => {
            this.mnemonicField = element
          },
          onKeyDown: (e) => e.key === 'Enter' && this.goBtn.click(),
        }),
        h(
          'span',
          undefined,
          h(
            'button',
            {
              class: `intro-button rounded-button ${
                mnemonic && !mnemonicValidationError ? 'pulse' : ''
              }`,
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
            'Go'
          )
        )
      ),
      h(
        'div',
        {class: 'centered-row'},
        h(
          'button',
          {
            class: 'demo-button rounded-button',
            /*
            * onMouseDown to prevent onBlur before handling the click event
            * https://stackoverflow.com/questions/17769005/onclick-and-onblur-ordering-issue
            */
            onMouseDown: (e) => isLeftClick(e, loadDemoWallet),
          },
          'Try demo wallet'
        )
      )
    )
  }
}

module.exports = connect(
  (state) => ({
    mnemonic: state.mnemonic,
    displayAboutOverlay: state.displayAboutOverlay,
    showDemoWalletWarningDialog: state.showDemoWalletWarningDialog,
    mnemonicValidationError: state.mnemonicValidationError,
    showMnemonicValidationError: state.showMnemonicValidationError,
  }),
  actions
)(LoadByMenmonicSectionClass)
