import {getDeviceBrandName, isHwWallet} from '../../wallet/helpers/cryptoProviderUtils'
import {h} from 'preact'
import actions from '../../actions'
import {useActions, useSelector} from '../../helpers/connect'
import {useGetCryptoProviderType} from '../../selectors'

type Props = {
  address: string
}

const AddressVerification = ({address}: Props) => {
  const {waitingHwWalletOperation, showVerification, verificationError} = useSelector((state) => ({
    waitingHwWalletOperation: state.waitingHwWalletOperation,
    showVerification: state.shouldShowAddressVerification,
    verificationError: state.addressVerificationError,
    cryptoProviderInfo: state.cryptoProviderInfo,
  }))
  const cryptoProviderType = useGetCryptoProviderType()

  const {verifyAddress} = useActions(actions)

  return showVerification && isHwWallet(cryptoProviderType) ? (
    verificationError ? (
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
          !waitingHwWalletOperation && verifyAddress(address)
        }}
      >
        {waitingHwWalletOperation === 'address_verification'
          ? 'Verifying address..'
          : `Verify on ${getDeviceBrandName(cryptoProviderType)}`}
      </a>
    )
  ) : null
}

export default AddressVerification
