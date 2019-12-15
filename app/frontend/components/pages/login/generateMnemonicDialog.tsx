import {h} from 'preact'
import {connect} from '../../../helpers/connect'
import {useMemo} from 'preact/hooks'
import actions from '../../../actions'
import Modal from '../../common/modal'
import {generateMnemonic} from '../../../wallet/mnemonic'

interface Props {
  closeGenerateMnemonicDialog: () => void
}

const GenerateMnemonicDialog = ({closeGenerateMnemonicDialog}: Props) => {
  const newWalletMnemonic = useMemo(() => generateMnemonic(15), [])

  return (
    <Modal onRequestClose={closeGenerateMnemonicDialog} title="Create a New Wallet" showWarning>
      <p className="modal-paragraph">
        The new wallet is created together with a mnemonic phrase. Write the mnemonic phrase down,
        you will need it to access your wallet.{' '}
        <strong>Don’t copy it to your clipboard or save it anywhere online.</strong>
      </p>
      <div className="modal-mnemonic one-click-select">{newWalletMnemonic}</div>
      <div className="modal-footer">
        <button
          className="button primary"
          onClick={closeGenerateMnemonicDialog}
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

export default connect(
  (state) => ({}),
  actions
)(GenerateMnemonicDialog)
