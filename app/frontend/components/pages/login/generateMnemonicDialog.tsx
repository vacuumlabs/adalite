import {h} from 'preact'
import {connect} from '../../../libs/unistore/preact'
import actions from '../../../actions'
import Modal from '../../common/modal'

interface Props {
  confirmGenerateMnemonicDialog: any
  newWalletMnemonic: string
  closeGenerateMnemonicDialog: any
}
class GenerateMnemonicDialogClass {
  render({confirmGenerateMnemonicDialog, newWalletMnemonic, closeGenerateMnemonicDialog}: Props) {
    return (
      <Modal
        closeHandler={closeGenerateMnemonicDialog}
        title="Create a New Wallet"
        showWarning={true}
      >
        <p className="modal-paragraph">
          The new wallet is created together with a mnemonic phrase. Write the mnemonic phrase down,
          you will need it to access your wallet.{' '}
          <strong>Don’t copy it to your clipboard or save it anywhere online.</strong>
        </p>
        <div className="modal-mnemonic one-click-select">{newWalletMnemonic}</div>
        <div className="modal-footer">
          <button
            className="button primary"
            onClick={confirmGenerateMnemonicDialog}
            onKeyDown={(e) => {
              e.key === 'Enter' && (e.target as HTMLButtonElement).click()
              e.preventDefault()
            }}
          >
            I wrote down my mnemonic
          </button>
        </div>
      </Modal>
    )
  }
}

export default connect(
  (state) => ({
    newWalletMnemonic: state.newWalletMnemonic,
  }),
  actions
)(GenerateMnemonicDialogClass)
