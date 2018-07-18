const {h} = require('preact')
const connect = require('unistore/preact').connect
const actions = require('../../../actions')

module.exports = connect(
  (state) => ({
    mnemonic: state.mnemonic,
  }),
  actions
)(({confirmGenerateMnemonicDialog, mnemonic, closeGenerateMnemonicDialog}) => {
  return h(
    'div',
    {class: 'overlay'},
    h(
      'div',
      {class: 'mnemonic-box-header box center fade-in-up'},
      h(
        'span',
        {
          class: 'overlay-close-button',
          onClick: closeGenerateMnemonicDialog,
        },
        ''
      ),
      h('h4', undefined, 'Generate a Mnemonic Phrase'),
      h(
        'h7',
        undefined,
        'Write these words down. Do not copy them to your clipboard or save them anywhere online.'
      ),
      h('div', {class: 'gray-row mnemonic-box no-events no-select'}, mnemonic),
      h('div', {class: ''}, h('button', {onClick: confirmGenerateMnemonicDialog}, 'Confirm'))
    )
  )
})
