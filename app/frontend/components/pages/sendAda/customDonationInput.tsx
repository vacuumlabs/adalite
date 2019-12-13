import {h} from 'preact'
import {connect} from '../../../helpers/connect'
import actions from '../../../actions'
import CustomInputButton from './customInputButton'

const CustomDonationInput = ({
  donationAmount,
  updateDonation,
  isSendAddressValid,
  toggleCustomDonation,
}) => (
  <div className="input-wrapper donation">
    <input
      className="input send-amount"
      id="custom"
      name="donation-amount"
      placeholder="0.000000"
      value={donationAmount.fieldValue}
      onInput={updateDonation}
    />
    <CustomInputButton isSendAddressValid={isSendAddressValid} />
  </div>
)

export default connect(
  (state) => ({
    donationAmount: state.donationAmount,
  }),
  actions
)(CustomDonationInput)
