import {h} from 'preact'
import {connect} from '../../../helpers/connect'
import actions from '../../../actions'
import Modal from '../../common/modal'
import Alert from '../../common/alert'

interface Props {
  closeNonShelleyCompatibleDialog: any
}
class NonShelleyCompatibleWarningDialogClass {
  render({closeNonShelleyCompatibleDialog}: Props) {
    return (
      <Modal
        onRequestClose={closeNonShelleyCompatibleDialog}
        title="You are accessing Shelley incompatible wallet."
        showWarning
      >
        <p className="modal-paragraph">
          You are accessing a wallet with 12-word mnemonic passphrase. These are not longer
          supported thus you won't be able to use the Shelley features. Depending on which wallet
          did you use before, we may not even show your whole balance (this applies especially for
          Daedalus wallet users) so if you dont see your whole balance, please use Deadealus. We
          strongly advise you to immediately transfer all funds from this wallet to a new Shelley
          compatible wallet.
        </p>
        <Alert alertType="error">
          <strong>We don't guarantee that the balance we show is correct!</strong>
        </Alert>
        <div />
        <p>
          To use your wallet to full extend please follow this guide to converting your wallet to
          AdaLite Shelley-compatible wallet.
        </p>
        <ol>
          <li>
            If you participated in the Incentivized Test Net staking, withdraw your rewards to your
            wallet balance on the "Staking" tab (top left corner of the screen), clicking on the
            Withdraw Rewards button (this button is visible only if you have some ITN rewards).
          </li>
          <li>Logout of this wallet.</li>
          <li>Navigate to main page and click "Create New Wallet" in the right top corner.</li>
          <li>Wrote down your new 15 word mnemonic seed phrase.</li>
          <li>Login with the new 15 word mnemonic.</li>
          <li>
            Navigate to the "Sending" screen and make copy of any of your address shown in "My
            Addresses tab"
          </li>
          <li>
            Now, login to your old (12-word mnemonic wallet) and send all your funds to the address
            you copied from the new wallet. Please make sure this address is starting with "addr1"
          </li>
          <li>
            Use the new 15 words mnemonic phrase seed wallet from now on with all the Shelley
            features.
          </li>
        </ol>
        <div className="modal-footer">{}</div>
      </Modal>
    )
  }
}

export default connect(
  null,
  actions
)(NonShelleyCompatibleWarningDialogClass)
