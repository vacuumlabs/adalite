import {h} from 'preact'
import {connect} from '../../../libs/unistore/preact'
import actions from '../../../actions'
import printAda from '../../../helpers/printAda'
import Modal from '../../common/modal'

class ConfirmTransactionDialogClass {
  cancelTx: HTMLAnchorElement

  componentDidMount() {
    this.cancelTx.focus()
  }

  render({
    sendAddress,
    sendAmount,
    transactionFee,
    submitTransaction,
    cancelTransaction,
    donationAmount,
    total,
  }) {
    return (
      <Modal closeHandler={cancelTransaction} title="Transaction review">
        <div className="review">
          <div className="review-label">Address</div>
          <div className="review-address">{sendAddress}</div>
          <div className="ada-label">Amount</div>
          <div className="review-amount">{printAda(sendAmount)}</div>
          <div className="ada-label">Donation</div>
          <div className="review-amount">{printAda(donationAmount)}</div>
          <div className="ada-label">Fee</div>
          <div className="review-fee">{printAda(transactionFee)}</div>
          <div className="ada-label">Total</div>
          <div className="review-total">{printAda(total)}</div>
        </div>
        <div className="review-bottom">
          <button className="button primary" onClick={submitTransaction}>
            Confirm Transaction
          </button>
          <a
            className="review-cancel"
            onClick={cancelTransaction}
            ref={(element) => {
              this.cancelTx = element
            }}
            onKeyDown={(e) => {
              e.key === 'Enter' && (e.target as HTMLAnchorElement).click()
            }}
          >
            Cancel Transaction
          </a>
        </div>
      </Modal>
    )
  }
}

export default connect(
  (state) => ({
    sendAddress: state.sendAddress.fieldValue,
    sendAmount: state.sendAmountForTransactionFee,
    transactionFee: state.transactionFee,
    donationAmount: state.donationAmountForTransactionFee,
  }),
  actions
)(ConfirmTransactionDialogClass)
