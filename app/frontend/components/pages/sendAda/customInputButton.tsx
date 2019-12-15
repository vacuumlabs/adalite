import {h} from 'preact'
import {connect} from '../../../helpers/connect'
import actions from '../../../actions'
import {AdaIcon} from '../../common/svg'
import {toAda} from '../../../helpers/adaConverters'

const CustomInputButton = ({
  isSendAddressValid,
  toggleCustomDonation,
  setDonation,
  donationAmount,
  maxDonationAmount,
}) => {
  const maxDonationAmountInAda = Math.floor(toAda(maxDonationAmount))

  return donationAmount.coins > maxDonationAmount ? (
    <button
      className="button send-max"
      onClick={(e) => {
        e.preventDefault()
        setDonation(maxDonationAmountInAda)
      }}
      disabled={!isSendAddressValid}
    >
      Max ({`${maxDonationAmountInAda} `}
      <AdaIcon />)
    </button>
  ) : (
    <button className="button send-max" onClick={toggleCustomDonation}>
      Back
    </button>
  )
}

export default connect(
  (state) => ({
    donationAmount: state.donationAmount,
    maxDonationAmount: state.maxDonationAmount,
  }),
  actions
)(CustomInputButton)
