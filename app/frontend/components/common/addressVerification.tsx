import {h} from 'preact'
import actions from '../../actions'
import {connect} from '../../helpers/connect'

const AddressVerification = ({
  showVerification,
  verificationError,
  verifyAddress,
  address,
  waitingForHwWallet,
  hwWalletName,
}) =>
  showVerification &&
  (verificationError ? (
    <div className="detail-error">
      <div>
        Verification failed.{' '}
        <a
          href="#"
          className="detail-verify"
          onClick={(e) => {
            e.preventDefault()
            verifyAddress(address)
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
        !waitingForHwWallet && verifyAddress(address)
      }}
    >
      {waitingForHwWallet ? 'Verifying address..' : `Verify on ${hwWalletName}`}
    </a>
  ))

export default connect(
  (state) => ({
    waitingForHwWallet: state.waitingForHwWallet,
    showVerification: state.shouldShowAddressVerification,
    verificationError: state.addressVerificationError,
    hwWalletName: state.hwWalletName,
  }),
  actions
)(AddressVerification)
