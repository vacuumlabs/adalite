import {h} from 'preact'
import {connect} from '../../../helpers/connect'
import actions from '../../../actions'
import Modal from '../../common/modal'
import Alert from '../../common/alert'

interface Props {
  closeDemoWalletWarningDialog: any
}
class DemoWalletWarningDialogClass {
  render({closeDemoWalletWarningDialog}: Props) {
    return (
      <Modal
        onRequestClose={closeDemoWalletWarningDialog}
        title="Accessing the demo wallet"
        showWarning
      >
        <p className="modal-paragraph">
          You are about to access a publicly available wallet intended to show the public how
          AdaLite looks and works. <strong>Your funds will not be safe here.</strong>
        </p>
        <Alert alertType="error">
          All funds you will store to the demo wallet will be accessible to all AdaLite users.{' '}
          <strong>Don’t store your ADA to the demo wallet!</strong>
        </Alert>
        <div className="modal-footer">
          <button
            className="button primary"
            onClick={closeDemoWalletWarningDialog}
            onKeyDown={(e) => {
              ;['Enter', 'Escape'].includes(e.key) && (e.target as HTMLButtonElement).click()
            }}
          >
            Continue to the demo wallet
          </button>
          <p className="modal-paragraph">
            To securely store ADA, <a href="/">create your new wallet</a>
          </p>
        </div>
      </Modal>
    )
  }
}

export default connect(
  null,
  actions
)(DemoWalletWarningDialogClass)
