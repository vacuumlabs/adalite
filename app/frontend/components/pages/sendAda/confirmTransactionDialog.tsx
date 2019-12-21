import {h, Component} from 'preact'
import {connect} from '../../../helpers/connect'
import actions from '../../../actions'
import printAda from '../../../helpers/printAda'
import Modal from '../../common/modal'
import RawTransactionModal from './rawTransactionModal'

interface Props {
  sendAddress: any
  submitTransaction: any
  cancelTransaction: any
  setRawTransactionOpen: any
  rawTransactionOpen: boolean
}

class ConfirmTransactionDialogClass extends Component<Props, {}> {
  cancelTx: HTMLAnchorElement

  componentDidMount() {
    this.cancelTx.focus()
  }

  render({
    sendAddress,
    summary,
    submitTransaction,
    cancelTransaction,
    setRawTransactionOpen,
    rawTransactionOpen,
  }) {
    const total = summary.amount + summary.donation + summary.fee

    return (
      <Modal onRequestClose={cancelTransaction} title="Transaction review">
        <div className="review">
          <div className="review-label">Address</div>
          <div className="review-address">{sendAddress}</div>
          <div className="ada-label">Amount</div>
          <div className="review-amount">{printAda(summary.amount)}</div>
          <div className="ada-label">Donation</div>
          <div className="review-amount">{printAda(summary.donation)}</div>
          <div className="ada-label">Fee</div>
          <div className="review-fee">{printAda(summary.fee)}</div>
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
        <a href="#" className="send-raw" onClick={setRawTransactionOpen}>
          Raw unsigned transaction
        </a>
        {rawTransactionOpen && <RawTransactionModal />}
      </Modal>
    )
  }
}

export default connect(
  (state) => ({
    sendAddress: state.sendAddress.fieldValue,
    summary: state.sendTransactionSummary,
    rawTransactionOpen: state.rawTransactionOpen,
  }),
  actions
)(ConfirmTransactionDialogClass)
