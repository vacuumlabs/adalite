import {h} from 'preact'
import {connect} from '../../../libs/unistore/preact'
import actions from '../../../actions'
import Modal from '../../common/modal'

class GenerateMnemonicDialogClass {
  render({confirmGenerateMnemonicDialog, newWalletMnemonic, closeGenerateMnemonicDialog}) {
    return h(
      Modal,
      {
        closeHandler: closeGenerateMnemonicDialog,
        title: 'Create a New Wallet',
        showWarning: true,
      },
      h(
        'p',
        {class: 'modal-paragraph'},
        'The new wallet is created together with a mnemonic phrase. Write the mnemonic phrase down, you will need it to access your wallet. ',
        h('strong', undefined, 'Don’t copy it to your clipboard or save it anywhere online.')
      ),
      h('div', {class: 'modal-mnemonic one-click-select'}, newWalletMnemonic),
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
          },
          'I wrote down my mnemonic'
        )
      )
    )
  }
}

export default connect(
  (state) => ({
    newWalletMnemonic: state.newWalletMnemonic,
  }),
  actions
)(GenerateMnemonicDialogClass)
