import {h, Component, Fragment} from 'preact'
import {useState, useEffect, useRef} from 'preact/hooks'
import {connect} from '../../../helpers/connect'
import actions from '../../../actions'
import printAda from '../../../helpers/printAda'
import Modal from '../../common/modal'
// import roundNumber from '../../../helpers/roundNumber'
import {Lovelace} from '../../../state'
import AddressVerification from '../../common/addressVerification'

interface Props {
  closePoolCertificateTxModal: any
  signPoolCertificateTx: any
}

const SignPoolCertTxModal = ({closePoolCertificateTxModal, signPoolCertificateTx}: Props) => {
  const cancelTx = useRef(null)

  useEffect(() => {
    cancelTx.current.focus()
  }, [])

  return (
    // TODO: make separate fragments into constants and then build specific types from them
    <Modal onRequestClose={closePoolCertificateTxModal} title={'Sign pool certificate transaction'}>
      <div>
        We are creating a hardware wallet signature of the given pool registration certificate
        transaction
      </div>
      {/* <div className="review">
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
        <div className="ada-label">Fee</div>
        <div className="review-fee">{printAda(summary.fee as Lovelace)}</div>
        <div className="ada-label">Total</div>
        <div className="review-total">{printAda(total)}</div>
      </div> */}

      <div className="review-bottom">
        <button className="button primary" onClick={signPoolCertificateTx}>
          Sign transaction
        </button>
        <a
          className="review-cancel"
          onClick={closePoolCertificateTxModal}
          ref={cancelTx}
          onKeyDown={(e) => {
            e.key === 'Enter' && (e.target as HTMLAnchorElement).click()
          }}
        >
          Cancel signing
        </a>
      </div>
    </Modal>
  )
}

export default connect(
  (state) => ({
    sendAddress: state.sendAddress.fieldValue,
    summary: state.sendTransactionSummary,
    rawTransactionOpen: state.rawTransactionOpen,
    stakePool: state.shelleyDelegation.selectedPool,
    txConfirmType: state.txConfirmType,
  }),
  actions
)(SignPoolCertTxModal)
