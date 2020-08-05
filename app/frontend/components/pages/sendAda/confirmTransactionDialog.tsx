import {h, Component, Fragment} from 'preact'
import {connect} from '../../../helpers/connect'
import actions from '../../../actions'
import printAda from '../../../helpers/printAda'
import Modal from '../../common/modal'
import RawTransactionModal from './rawTransactionModal'
// import roundNumber from '../../../helpers/roundNumber'
import {Lovelace} from '../../../state'

interface Props {
  sendAddress: any
  submitTransaction: any
  cancelTransaction: any
  setRawTransactionOpen: any
  rawTransactionOpen: boolean
  isDelegation?: boolean
  stakePool: any
  txConfirmType: string
  showVerification: any
  waitingForHwWallet: any
  verificationError: any
  verifyAddress: any
  hwWalletName: any
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
    stakePool,
    txConfirmType,
    showVerification,
    waitingForHwWallet,
    verificationError,
    verifyAddress,
    hwWalletName,
  }) {
    const total = summary.amount + summary.donation + summary.fee + summary.deposit
    const titleMap = {
      delegate: 'Delegation review',
      revoke: 'Delegation revocation review',
      send: 'Transaction review',
      convert: 'Stakable balance conversion review',
      redeem: 'Rewards redemption review',
    }
    return (
      // TODO: make separate fragments into constants and then build specific types from them
      <Modal onRequestClose={cancelTransaction} title={titleMap[txConfirmType]}>
        {txConfirmType === 'convert' && (
          <div>
            We are creating transaction that will send all funds from your non-staking addresses to
            your first staking address
          </div>
        )}
        {txConfirmType === 'redeem' && (
          <div>
            We are creating transaction that will redeem all funds from your rewards account balance
            to your first staking address
          </div>
        )}
        <div className="review">
          {txConfirmType === 'send' && (
            <Fragment>
              <div className="review-label">Address</div>
              <div className="review-address">{sendAddress}</div>
            </Fragment>
          )}

          {txConfirmType === 'convert' && ( // TODO: make address validation into component
            <Fragment>
              <div className="review-label">Address</div>
              <div className="review-address">
                {summary.plan.outputs[0].address}
                {true &&
                  (verificationError ? (
                    <div className="detail-error" style="float: right;">
                      <div>
                        Verification failed.{' '}
                        <a
                          href="#"
                          className="detail-verify"
                          onClick={(e) => {
                            e.preventDefault()
                            verifyAddress(summary.plan.outputs[0].address)
                          }}
                        >
                          Try again
                        </a>
                      </div>
                    </div>
                  ) : (
                    <a
                      href="#"
                      className="detail-verify"
                      style="float: right;"
                      onClick={(e) => {
                        e.preventDefault()
                        !waitingForHwWallet && verifyAddress(summary.plan.outputs[0].address)
                      }}
                    >
                      {waitingForHwWallet ? 'Verifying address..' : `Verify on ${hwWalletName}`}
                    </a>
                  ))}
              </div>
            </Fragment>
          )}

          {(txConfirmType === 'send' || txConfirmType === 'convert') && (
            <Fragment>
              <div className="ada-label">Amount</div>
              <div className="review-amount">{printAda(summary.amount)}</div>
            </Fragment>
          )}

          {txConfirmType === 'redeem' && ( // TODO: add address verification for hw wallets
            <Fragment>
              <div className="review-label">Address</div>
              <div className="review-address">{summary.plan.change.address}</div>
              <div className="ada-label">Rewards</div>
              <div className="review-amount">{printAda(summary.plan.withdrawals[0].rewards)}</div>
            </Fragment>
          )}

          {txConfirmType === 'send' && (
            <Fragment>
              <div className="ada-label">Donation</div>
              <div className="review-amount">{printAda(summary.donation)}</div>
            </Fragment>
          )}
          {txConfirmType === 'delegate' && (
            <Fragment>
              <div className="review-label">Pool ID</div>
              <div className="review-amount">{stakePool.poolHash}</div>
              <div className="review-label">Pool Name</div>
              <div className="review-amount">{stakePool.name}</div>
              <div className="review-label">Ticker</div>
              <div className="review-amount">{stakePool.ticker}</div>
              <div className="review-label">Tax</div>
              <div className="review-amount">
                {stakePool.margin && stakePool.margin * 100}
                %
              </div>
              <div className="review-label">Fixed cost</div>
              <div className="review-amount">
                {stakePool.fixedCost && printAda(stakePool.fixedCost)}
              </div>
              <div className="review-label">Homepage</div>
              <div className="review-amount">{stakePool.homepage}</div>
              <div className="ada-label">Deposit</div>
              <div className="review-fee">{printAda(summary.plan.deposit)}</div>
            </Fragment>
          )}
          <div className="ada-label">Fee</div>
          <div className="review-fee">{printAda(summary.fee as Lovelace)}</div>
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
    stakePool: state.shelleyDelegation.selectedPool,
    txConfirmType: state.txConfirmType,
    waitingForHwWallet: state.waitingForHwWallet,
    showVerification: state.shouldShowAddressVerification,
    verificationError: state.addressVerificationError,
    hwWalletName: state.hwWalletName,
  }),
  actions
)(ConfirmTransactionDialogClass)
