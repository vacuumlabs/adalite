import {h, Component} from 'preact'
import * as QRious from '../../libs/qrious'
import {connect} from '../../helpers/connect'
import actions from '../../actions'

import Modal from './modal'
import CopyOnClick from './copyOnClick'

interface Props {
  showDetail: any
  closeAddressDetail: (state: any) => void
  verificationError: boolean
  verifyAddress: () => void
  showVerification: boolean
  hwWalletName: string
  waitingForHwWallet: boolean
}

class AddressDetailDialogClass extends Component<Props, {showCopyMessage: boolean}> {
  constructor(props) {
    super(props)
    this.state = {showCopyMessage: false}
    this.toggleCopyMessage = this.toggleCopyMessage.bind(this)
  }

  toggleCopyMessage(copied) {
    this.setState({showCopyMessage: copied})
  }

  render(
    {
      showDetail,
      closeAddressDetail,
      verificationError,
      verifyAddress,
      showVerification,
      hwWalletName,
      waitingForHwWallet,
    },
    {showCopyMessage}
  ) {
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
                  copiedCallback={this.toggleCopyMessage}
                  enableTooltip={false}
                >
                  <span className="copy-text">{''}</span>
                </CopyOnClick>
                {showCopyMessage && (
                  <span className="detail-copy-message">Copied to clipboard</span>
                )}
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
}

export default connect(
  (state) => ({
    showDetail: state.showAddressDetail,
    verificationError: state.addressVerificationError,
    showVerification: state.showAddressVerification,
    waitingForHwWallet: state.waitingForHwWallet,
    hwWalletName: state.hwWalletName,
  }),
  actions
)(AddressDetailDialogClass)
