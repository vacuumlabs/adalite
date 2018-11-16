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
      },
      h(
        'div',
        {class: 'margin-top-sm center'},
        h('h4', undefined, 'Generate a Mnemonic Phrase'),
        h(
          'h7',
          undefined,
          'Write these words down. ',
          h('b', undefined, 'Do not copy them to your clipboard or save them anywhere online!')
        ),
        h('div', {class: 'gray-row mnemonic-box force-select-all'}, mnemonic),
        h(
          'div',
          {class: ''},
          h(
            'button',
            {
              onClick: confirmGenerateMnemonicDialog,
              onKeyDown: (e) => {
                e.key === 'Enter' && e.target.click()
                e.preventDefault()
              },
              ref: (element) => {
                this.confirmBtn = element
              },
            },
            'Confirm'
          )
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
