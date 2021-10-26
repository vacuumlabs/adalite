import {h, Fragment} from 'preact'
import {useEffect, useRef} from 'preact/hooks'
import {connect} from '../../../helpers/connect'
import actions from '../../../actions'
import printAda from '../../../helpers/printAda'
import Modal from '../../common/modal'
import {CertificateType, Lovelace} from '../../../types'
import {State} from '../../../state'

interface Props {
  closePoolRegTransactionModal: any
  signPoolCertificateTx: any
  poolCert: any
}

const SignPoolCertTxModal = ({
  closePoolRegTransactionModal,
  signPoolCertificateTx,
  poolCert,
}: Props) => {
  const cancelTx = useRef<HTMLAnchorElement>(null)

  useEffect(() => {
    if (cancelTx.current) {
      cancelTx.current.focus()
    }
  }, [])

  return (
    <Modal
      onRequestClose={closePoolRegTransactionModal}
      title={'Sign pool certificate transaction'}
    >
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
          <div className="review-amount">{poolCert.rewardAccountHex}</div>
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
            {(poolCert.margin.numeratorStr * 100) / poolCert.margin.denominatorStr}%
          </div>
          {poolCert.poolOwners.map((owner, i) => (
            <Fragment key={i}>
              <div className="review-label">Owner #{i + 1}</div>
              <div className="review-amount">{owner.stakingKeyHashHex || owner.pubKeyHex}</div>
            </Fragment>
          ))}
          {poolCert.metadata && (
            <Fragment>
              <div className="review-label">Metadata url</div>
              <div className="review-amount">{poolCert.metadata.metadataUrl}</div>
              <div className="review-label">Metadata hash</div>
              <div className="review-amount">{poolCert.metadata.metadataHashHex}</div>
            </Fragment>
          )}
          {/* relays */}
        </Fragment>
      </div>

      <div className="review-bottom">
        <button className="button primary" onClick={signPoolCertificateTx}>
          Sign transaction
        </button>
        <a
          className="review-cancel"
          onClick={closePoolRegTransactionModal}
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
  (state: State) => ({
    poolCert: state.poolRegTransactionSummary.plan
      ? state.poolRegTransactionSummary.plan.certificates[0].type ===
          CertificateType.STAKEPOOL_REGISTRATION &&
        state.poolRegTransactionSummary.plan.certificates[0].poolRegistrationParams
      : {},
  }),
  actions
)(SignPoolCertTxModal)
