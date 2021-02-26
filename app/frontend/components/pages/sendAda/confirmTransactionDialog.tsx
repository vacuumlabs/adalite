import {h, Component, Fragment} from 'preact'
import {connect} from '../../../helpers/connect'
import actions from '../../../actions'
import printAda from '../../../helpers/printAda'
import Modal from '../../common/modal'
import RawTransactionModal from './rawTransactionModal'
import {SendTransactionSummary, State} from '../../../state'
import AddressVerification from '../../common/addressVerification'
import tooltip from '../../common/tooltip'
import {AssetType, Lovelace} from '../../../types'

interface Props {
  sendAddress: any
  submitTransaction: any
  cancelTransaction: any
  setRawTransactionOpen: any
  rawTransactionOpen: boolean
  isDelegation?: boolean
  stakePool: any
  txConfirmType: string
  summary: SendTransactionSummary
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
  }: Props) {
    // TODO: refactor all of this
    const summarySendAmount =
      summary.amount?.assetType === AssetType.ADA ? summary.amount?.coins : (0 as Lovelace)
    const totalAmount = (summarySendAmount + summary.fee + summary.deposit) as Lovelace
    const totalAmounts = {
      convert: summarySendAmount,
      withdraw: (summary.rewards ?? (0 as Lovelace)) - summary.fee,
    }
    const total = (totalAmounts[txConfirmType] as Lovelace) || (totalAmount as Lovelace)
    const titleMap = {
      delegate: 'Delegation review',
      revoke: 'Delegation revocation review',
      send: 'Transaction review',
      convert: 'Stakable balance conversion review',
      withdraw: 'Rewards withdrawal review',
      crossAccount: 'Transaction between accounts review',
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
        {txConfirmType === 'withdraw' && (
          <div>
            We are creating transaction that will withdraw all funds from your rewards account
            balance to your first staking address
          </div>
        )}
        <div className="review">
          {(txConfirmType === 'send' || txConfirmType === 'crossAccount') && (
            <Fragment>
              <div className="review-label">Address</div>
              <div className="review-address">
                {sendAddress}
                {txConfirmType === 'crossAccount' && <AddressVerification address={sendAddress} />}
              </div>
              {/* TODO: Hide ADA symbol when handling tokens */}
              <div className="ada-label">Amount</div>
              <div className="review-amount">{printAda(summarySendAmount)}</div>
            </Fragment>
          )}

          {txConfirmType === 'convert' && (
            <Fragment>
              <div className="review-label">Address</div>
              <div className="review-address">
                {summary.plan.outputs[0].address}
                <AddressVerification address={summary.plan.outputs[0].address} />
              </div>
              <div className="ada-label">Amount</div>
              <div className="review-amount">{printAda(totalAmount)}</div>
            </Fragment>
          )}

          {txConfirmType === 'withdraw' && (
            <Fragment>
              <div className="review-label">Address</div>
              <div className="review-address">
                {summary.plan.change.address}
                <AddressVerification address={summary.plan.change.address} />
              </div>
              <div className="ada-label">Rewards</div>
              <div className="review-amount">{printAda(summary.plan.withdrawals[0].rewards)}</div>
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
              <div className="review-amount">{stakePool.margin && stakePool.margin * 100}%</div>
              <div className="review-label">Fixed cost</div>
              <div className="review-amount">
                {stakePool.fixedCost && printAda(stakePool.fixedCost)}
              </div>
              <div className="review-label">Homepage</div>
              <div className="review-amount">{stakePool.homepage}</div>
              <div className="ada-label">Deposit</div>
              <div className="review-fee">
                {printAda(summary.plan.deposit)}
                <a
                  {...tooltip(
                    'Required deposit for address stake key registration is 2 ADA. Deposit is made with your first delegation. Further delegations do not require any additional deposits.',
                    true
                  )}
                >
                  <span className="show-info">{''}</span>
                </a>
              </div>
            </Fragment>
          )}
          <div className="ada-label">Fee</div>
          <div className="review-fee">{printAda(summary.fee as Lovelace)}</div>
          {/* TODO: Hide ADA symbol when handling tokens */}
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
  (state: State) => ({
    sendAddress: state.sendAddress.fieldValue,
    summary: state.sendTransactionSummary,
    rawTransactionOpen: state.rawTransactionOpen,
    stakePool: state.shelleyDelegation.selectedPool,
    txConfirmType: state.txConfirmType,
  }),
  actions
)(ConfirmTransactionDialogClass)
