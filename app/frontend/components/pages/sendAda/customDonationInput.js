import {h} from 'preact'
import {connect} from 'unistore/preact'
import actions from '../../../actions'
import CustomInputButton from './customInputButton'

const CustomDonationInput = ({
  donationAmount,
  updateDonation,
  isSendAddressValid,
  toggleCustomDonation,
}) =>
  h(
    'div',
    {class: 'input-wrapper donation'},
    h('input', {
      class: 'input send-amount',
      id: 'custom',
      name: 'donation-amount',
      placeholder: '0.000000',
      value: donationAmount.fieldValue,
      onInput: updateDonation,
    }),
    h(CustomInputButton, {isSendAddressValid})
  )

export default connect(
  (state) => ({
    donationAmount: state.donationAmount,
  }),
  actions
)(CustomDonationInput)
