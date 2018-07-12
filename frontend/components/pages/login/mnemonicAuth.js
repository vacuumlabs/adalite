const {h} = require('preact')
const translations = require('../../../translations')

const GenerateMnemonicDialog = require('./generateMnemonicDialog')

const LoadByMenmonicSection = ({
  mnemonic,
  mnemonicValidationError,
  updateMnemonic,
  checkForMnemonicValidationError,
  loadWallet,
  openGenerateMnemonicDialog,
  showGenerateMnemonicDialog,
  loadDemoWallet,
  showMnemonicValidationError,
}) =>
  h(
    'div',
    {class: 'auth-section'},
    h(
      'div',
      {class: 'centered-row margin-bottom'},
      'Enter the 12-word wallet mnemonic or 27-word Daedalus paper wallet mnemonic'
    ),
    mnemonicValidationError &&
      showMnemonicValidationError &&
      h('p', {class: 'alert error'}, translations[mnemonicValidationError.code]()),
    h(
      'div',
      {class: 'intro-input-row'},
      h('input', {
        type: 'text',
        class: 'styled-input-nodiv styled-unlock-input',
        id: 'mnemonic-submitted',
        name: 'mnemonic-submitted',
        placeholder: 'Enter wallet mnemonic',
        value: mnemonic,
        onInput: updateMnemonic,
        onBlur: checkForMnemonicValidationError,
        autocomplete: 'nope',
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
          },
          'Go'
        )
      )
    ),
    h(
      'a',
      {
        class: 'intro-link fade-in-up',
        onClick: openGenerateMnemonicDialog,
      },
      '…or generate a new one'
    ),
    showGenerateMnemonicDialog && h(GenerateMnemonicDialog),
    h(
      'div',
      {class: 'centered-row'},
      h(
        'button',
        {
          class: 'demo-button rounded-button',
          onClick: loadDemoWallet,
        },
        'Try demo wallet'
      )
    )
  )

module.exports = LoadByMenmonicSection
