const {h, Component} = require('preact')
const connect = require('unistore/preact').connect
const actions = require('../../../actions')
const Modal = require('../../common/modal')

class GenerateMnemonicDialogClass extends Component {
  componentDidMount() {
    this.confirmBtn.focus()
  }

  render({confirmGenerateMnemonicDialog, mnemonic, closeGenerateMnemonicDialog}) {
    return h(
      Modal,
      {
        closeHandler: closeGenerateMnemonicDialog,
        title: 'Create New Wallet',
        showWarning: true,
      },
      h(
        'p',
        {class: 'modal-paragraph'},
        'New wallet is created together with a mnemonic phrase. Write the mnemonic phrase down, you will need it to access your wallet. ',
        h('strong', undefined, 'Don’t copy it to your clipboard or save it anywhere online.')
      ),
      h('div', {class: 'modal-mnemonic'}, mnemonic),
      h(
        'div',
        {class: 'modal-footer'},
        h(
          'button',
          {
            class: 'button primary',
            onClick: confirmGenerateMnemonicDialog,
            onKeyDown: (e) => {
              e.key === 'Enter' && e.target.click()
              e.preventDefault()
            },
            ref: (element) => {
              this.confirmBtn = element
            },
          },
          'I’ve written my mnemonic down'
        )
      )
    )
  }
}

module.exports = connect(
  (state) => ({
    mnemonic: state.mnemonic,
  }),
  actions
)(GenerateMnemonicDialogClass)
