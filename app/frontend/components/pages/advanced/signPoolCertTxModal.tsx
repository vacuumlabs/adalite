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
  poolCert: any
  ttl: any
}

const SignPoolCertTxModal = ({
  closePoolCertificateTxModal,
  signPoolCertificateTx,
  poolCert,
  ttl,
}: Props) => {
  const cancelTx = useRef(null)

  useEffect(() => {
    cancelTx.current.focus()
  }, [])

  return (
    <Modal onRequestClose={closePoolCertificateTxModal} title={'Sign pool certificate transaction'}>
      <div>
        We are creating a hardware wallet signature of the given pool registration certificate
        transaction
      </div>
      <div className="review pool-owner">
        <Fragment>
          <div className="review-label">Key hash</div>
          <div className="review-amount">{poolCert.poolKeyHashHex}</div>
          <div className="review-label">Vrf hash</div>
          <div className="review-amount">{poolCert.vrfKeyHashHex}</div>
          <div className="review-label">Reward address</div>
          <div className="review-amount">{poolCert.rewardAccountKeyHash}</div>
          <div className="ada-label">Fixed Cost</div>
          <div className="review-amount">
            {printAda(parseInt(poolCert.costStr, 10) as Lovelace)}
          </div>
          <div className="ada-label">Pledge</div>
          <div className="review-amount">
            {printAda(parseInt(poolCert.pledgeStr, 10) as Lovelace)}
          </div>
          <div className="review-label">Margin</div>
          <div className="review-amount">
            {poolCert.margin.numeratorStr}/{poolCert.margin.denominatorStr}
          </div>
          {poolCert.poolOwners.map((owner, i) => (
            <Fragment key={i}>
              <div className="review-label">Owner #{i}</div>
              <div className="review-amount">{owner.stakingKeyHashHex || owner.pubKeyHex}</div>
            </Fragment>
          ))}
          <div className="review-label">Metadata url</div>
          <div className="review-amount">{poolCert.metadata.metadataUrl}</div>
          <div className="review-label">Metadata hash</div>
          <div className="review-amount">{poolCert.metadata.metadataHashHex}</div>
          {/* relays */}
        </Fragment>
      </div>

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
    poolCert: state.poolCertTxVars.plan
      ? state.poolCertTxVars.plan.certs[0].poolRegistrationParams
      : {},
    ttl: state.poolCertTxVars.ttl,
  }),
  actions
)(SignPoolCertTxModal)
