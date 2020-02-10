import {h, Component, Fragment} from 'preact'
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
  isDelegation?: boolean
  isRevoke: boolean
  stakePools: any
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
    isDelegation,
    isRevoke,
    stakePools
  }) {
    const total = summary.amount + summary.donation + summary.fee

    return (
      <Modal
        onRequestClose={cancelTransaction}
        title={isRevoke ? 'Delegation revocation review' : 'Transaction review'}
      >
        <div className="review">
          {!isDelegation && (
            <Fragment>
              <div className="review-label">Address</div>
              <div className="review-address">{sendAddress}</div>
              <div className="ada-label">Amount</div>
              <div className="review-amount">{printAda(summary.amount)}</div>
              <div className="ada-label">Donation</div>
              <div className="review-amount">{printAda(summary.donation)}</div>
            </Fragment>
          )}
          {!isRevoke &&
            isDelegation &&
            stakePools.map((pool, i) => (
              <Fragment>
                <div className="review-label">Pool ID</div>
                <div className="review-amount">{pool.poolIdentifier}</div>
                <div className="review-label">Pool Name</div>
                <div className="review-amount">{pool.name}</div>
                <div className="review-label">Ticker</div>
                <div className="review-amount">{pool.ticker}</div>
                <div className="review-label">Tax</div>
                <div className="review-amount">
                  {pool.rewards &&
                    (pool.rewards.ratio[0] * 100) / pool.rewards.ratio[1]}%
                </div>
                <div className="review-label">Homepage</div>
                <div className="review-amount">{pool.homepage}</div>
              </Fragment>
            ))}
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
            ref={element => {
              this.cancelTx = element
            }}
            onKeyDown={e => {
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
  state => ({
    sendAddress: state.sendAddress.fieldValue,
    summary: state.sendTransactionSummary,
    rawTransactionOpen: state.rawTransactionOpen,
    stakePools: state.shelleyDelegation.selectedPools,
    isRevoke: state.isRevoke
  }),
  actions
)(ConfirmTransactionDialogClass)
