import {h} from 'preact'
import {useState, useCallback} from 'preact/hooks'
import * as QRious from '../../libs/qrious'
import {useSelector, useActions} from '../../helpers/connect'
import actions from '../../actions'

import Modal from './modal'
import CopyOnClick from './copyOnClick'

const AddressDetailDialog = () => {
  const [showCopyMessage, setCopyMessage] = useState(false)
  const copiedCallback = useCallback(() => setCopyMessage(true), [setCopyMessage])
  const {
    showDetail,
    verificationError,
    showVerification,
    waitingForHwWallet,
    hwWalletName,
  } = useSelector((state) => ({
    showDetail: state.showAddressDetail,
    verificationError: state.addressVerificationError,
    showVerification: state.showAddressVerification,
    waitingForHwWallet: state.waitingForHwWallet,
    hwWalletName: state.hwWalletName,
  }))
  const {verifyAddress, closeAddressDetail} = useActions(actions)

  return (
    showDetail && (
      <Modal onRequestClose={closeAddressDetail}>
        <div className="detail">
          <div className="detail-content">
            <div className="detail-label">Address</div>
            <div className="detail-input address">
              <CopyOnClick value={showDetail.address} copy={showDetail.copyOnClick}>
                <div className="detail-address">{showDetail.address}</div>
              </CopyOnClick>
              <CopyOnClick
                value={showDetail.address}
                elementClass="address-copy copy"
                copiedCallback={copiedCallback}
                enableTooltip={false}
              >
                <span className="copy-text">{''}</span>
              </CopyOnClick>
              {showCopyMessage && <span className="detail-copy-message">Copied to clipboard</span>}
            </div>
            <div className="detail-label">Derivation path</div>
            <div className="detail-row">
              <div className="detail-input">
                <div className="detail-derivation">{showDetail.bip32path}</div>
              </div>
              {showVerification &&
                (verificationError ? (
                  <div className="detail-error">
                    <div>
                      Verification failed.{' '}
                      <a
                        href="#"
                        className="detail-verify"
                        onClick={(e) => {
                          e.preventDefault()
                          verifyAddress()
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
                    onClick={(e) => {
                      e.preventDefault()
                      !waitingForHwWallet && verifyAddress()
                    }}
                  >
                    {waitingForHwWallet ? 'Verifying address..' : `Verify on ${hwWalletName}`}
                  </a>
                ))}
            </div>
          </div>
          <div className="detail-qr">
            <img
              src={new QRious({
                value: showDetail.address,
                level: 'M',
                size: 200,
              }).toDataURL()}
            />
          </div>
        </div>
      </Modal>
    )
  )
}

export default AddressDetailDialog
